<script>
    $(document).ready(function () {
        function sendHeight() {
            window.parent.postMessage({height: 0}, '*');
        }

        window.addEventListener('load', sendHeight);
        window.addEventListener('resize', sendHeight);

        const observer = new ResizeObserver(sendHeight);
        observer.observe(document.body);
    });
</script>