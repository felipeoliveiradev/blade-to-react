<div 
    data-blade-react="{{ $component }}"
    @foreach(json_decode($props, true) ?? [] as $key => $value)
        data-prop-{{ Str::kebab($key) }}="{{ is_string($value) ? $value : json_encode($value) }}"
    @endforeach
></div>

@once
    @push('scripts')
        @if($hasReactComponents)
            <script>
                document.addEventListener('DOMContentLoaded', () => {
                    if (window.blade) {
                        blade.init({
                            debug: @json(config('blade-to-react.debug', false)),
                            autoInit: @json(config('blade-to-react.auto_init', true))
                        });
                    }
                });
            </script>
        @endif
    @endpush
@endonce
