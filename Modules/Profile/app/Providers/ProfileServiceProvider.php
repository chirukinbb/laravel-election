<?php

namespace Modules\Profile\Providers;

use Illuminate\Support\Facades\Event;
use JeroenNoten\LaravelAdminLte\Events\BuildingMenu;
use Nwidart\Modules\Support\ModuleServiceProvider;

class ProfileServiceProvider extends ModuleServiceProvider
{
    /**
     * The name of the module.
     */
    protected string $name = 'Profile';

    /**
     * The lowercase version of the module name.
     */
    protected string $nameLower = 'profile';

    /**
     * Command classes to register.
     *
     * @var string[]
     */
    // protected array $commands = [];

    /**
     * Provider classes to register.
     *
     * @var string[]
     */
    protected array $providers = [
        EventServiceProvider::class,
        RouteServiceProvider::class,
    ];

    /**
     * Define module schedules.
     *
     * @param $schedule
     */
    public function boot(): void
    {
        $this->registerTranslations();
        $this->registerConfig();
        $this->registerViews();
        $this->loadMigrationsFrom(module_path($this->name, 'Database/Migrations'));

        Event::listen(BuildingMenu::class, function (BuildingMenu $event) {
            $event->menu->addBefore('settings', [
                'text' => 'User Management',
                'url' => route('users::index'),
                'key' => 'users',
                'icon' => 'fas fa-fw fa-users',
            ]);
            $event->menu->add([
                'text' => 'My Profile',
                'url' => route('users::profile.index'),
                'icon' => 'fas fa-fw fa-user',
                'classes' => 'text-center',
                'topnav_user' => true
            ]);
        });
    }
}
