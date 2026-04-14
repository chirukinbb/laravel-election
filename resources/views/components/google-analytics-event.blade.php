@props(['selector', 'eventName'])

<script>
    document.addEventListener('DOMContentLoaded', function () {
        const elements = document.querySelectorAll('{{ $selector }}');

        elements.forEach(function (element) {
            element.addEventListener('click', function () {
                if (typeof gtag !== 'undefined') {
                    gtag('event', '{{ $eventName }}');
                }
            });
        });
    });
</script>
