<?php

namespace App\Services;

use Exception;
use Google\Cloud\ApiKeys\V2\Client\ApiKeysClient;
use Google\Cloud\ApiKeys\V2\CreateKeyRequest;
use Google\Cloud\ApiKeys\V2\Key;
use Google\Cloud\ResourceManager\V3\Client\ProjectsClient;
use Google\Cloud\ResourceManager\V3\CreateProjectRequest;
use Google\Cloud\ResourceManager\V3\Project;
use Google\Cloud\ServiceUsage\V1\BatchEnableServicesRequest;
use Google\Cloud\ServiceUsage\V1\Client\ServiceUsageClient;
use Illuminate\Support\Facades\Log;

class GoogleCloudService
{
    private array $clientOptions;
    private ?string $billingAccount;
    private int $organization;

    /**
     * @param string $serviceAccountJson Содержимое JSON-файла сервисного аккаунта
     * @param string|null $proxy Формат: "socks5://user:pass@host:port" или "host:port"
     */
    public function __construct(string $serviceAccountJson, int $organization, ?string $proxy = null, ?string $billingAccount = null)
    {
        $this->billingAccount = $billingAccount;
        $this->organization = $organization;

        $authData = json_decode($serviceAccountJson, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception("Ошибка в JSON сервисного аккаунта: " . json_last_error_msg());
        }

        // Базовые опции для всех клиентов
        $this->clientOptions = [
            'credentials' => $authData,
        ];

        // Настройка прокси
        if ($proxy) {
            // Для gRPC (основной транспорт Google)
            $this->clientOptions['transportConfig'] = [
                'grpc' => [
                    'stubOpts' => [
                        'grpc.http_proxy' => $proxy
                    ]
                ],
                'rest' => [
                    'options' => [
                        'proxy' => $proxy
                    ]
                ]
            ];
        }
    }

    /**
     * 1. Создание проекта
     */
    public function createProject(string $projectId, string $projectName): string
    {
        Log::info("Шаг 1: Создание проекта $projectId");
        $projectsClient = new ProjectsClient($this->clientOptions);

        $project = (new Project())
            ->setProjectId($projectId)
            ->setDisplayName($projectName)
            // Указываем родителя. Формат: "organizations/12345678"
            ->setParent("organizations/" . $this->organization);

        $request = (new CreateProjectRequest())
            ->setProject($project);

        $operation = $projectsClient->createProject($request);
        $operation->pollUntilComplete();

        if ($operation->operationSucceeded()) {
            return $projectId;
        }

        throw new Exception("Ошибка создания: " . $operation->getError()->getMessage());
    }

    /**
     * 2. Привязка биллинга
     */
    public function enableBilling(string $projectId, string $billingAccount): void
    {
        Log::info("Шаг 2: Привязка биллинга к $projectId");
        $billingClient = new \Google\Cloud\Billing\V1\Client\CloudBillingClient($this->clientOptions);

        // 1. Создаем объект с информацией о биллинге
        $billingInfo = (new \Google\Cloud\Billing\V1\ProjectBillingInfo())
            ->setBillingAccountName("billingAccounts/" . $billingAccount);

        // 2. Создаем объект запроса (именно его требует метод updateProjectBillingInfo)
        $request = (new \Google\Cloud\Billing\V1\UpdateProjectBillingInfoRequest())
            ->setName("projects/$projectId")
            ->setProjectBillingInfo($billingInfo);

        // 3. Отправляем запрос
        $billingClient->updateProjectBillingInfo($request);
    }

    /**
     * 3. Включение нужных API (Без этого ключи не создадутся)
     */
    public function enableRequiredApis(string $projectId): void
    {
        Log::info("Шаг 3: Активация API для $projectId");
        $usageClient = new ServiceUsageClient($this->clientOptions);

        $services = [
            'apikeys.googleapis.com',           // Для управления ключами
            'generativelanguage.googleapis.com' // Для работы с AI (Gemini)
        ];

        $request = (new BatchEnableServicesRequest())
            ->setParent("projects/$projectId")
            ->setServiceIds($services);

        $operation = $usageClient->batchEnableServices($request);
        $operation->pollUntilComplete();
    }

    /**
     * 4. Создание самого API ключа
     */
    public function createApiKey(string $projectId, string $displayName): array
    {
        Log::info("Шаг 4: Генерация API ключа для $projectId");
        $apiKeysClient = new ApiKeysClient($this->clientOptions);

        $key = (new Key())->setDisplayName($displayName);

        $request = (new CreateKeyRequest())
            ->setParent("projects/$projectId/locations/global")
            ->setKey($key);

        $operation = $apiKeysClient->createKey($request);
        $operation->pollUntilComplete();

        if ($operation->operationSucceeded()) {
            /** @var Key $resultKey */
            $resultKey = $operation->getResult();

            return [
                'key_string' => $resultKey->getKeyString(), // Тот самый AIza...
                'name' => $resultKey->getName()
            ];
        }

        throw new Exception("Ошибка генерации ключа: " . $operation->getError()->getMessage());
    }

    /**
     * Итоговый метод: Генерация 5 проектов под ключ
     */
    public function generateFiveProjects(): array
    {
        if (!$this->billingAccount) {
            throw new Exception("ID биллинг-аккаунта не указан!");
        }

        $finalKeys = [];
        for ($i = 1; $i <= 5; $i++) {
            // Генерируем уникальный ID (только маленькие буквы, цифры и тире)
            // Вариант: префикс (3) + дата (6) + рандом (10) = 19 символов. Точно влезет.
            $uniqueId = "ai-" . date('ymd') . "-" . strtolower(\Illuminate\Support\Str::random(10));

            try {
                // Выполняем цепочку
                $this->createProject($uniqueId, "Auto AI Project $i");
                $this->enableBilling($uniqueId, $this->billingAccount);
                $this->enableRequiredApis($uniqueId);

                // Иногда Google нужно пару секунд, чтобы "осознать" включение API
                sleep(3);

                $keyData = $this->createApiKey($uniqueId, "AI Key $i");

                $finalKeys[] = [
                    'project_id' => $uniqueId,
                    'api_key' => $keyData['key_string']
                ];

                Log::info("Проект $i готов: $uniqueId");
            } catch (Exception $e) {
                Log::error("Ошибка на проекте $i: " . $e->getMessage());
                $finalKeys[] = ['error' => "Project $i failed: " . $e->getMessage()];
            }
        }

        return $finalKeys;
    }
}
