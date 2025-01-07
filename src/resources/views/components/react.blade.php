@props(['name', 'props' => []])

<div 
    data-blade-react="{{ $name }}"
    @foreach($props as $key => $value)
        data-prop-{{ Str::kebab($key) }}="{{ is_string($value) ? $value : json_encode($value) }}"
    @endforeach
>
    {!! $slot !!}

    {{-- Processa atributos slot: --}}
    @foreach($attributes->getAttributes() as $key => $value)
        @if(str_starts_with($key, 'slot:'))
            <div data-slot="{{ str_replace('slot:', '', $key) }}">
                {!! $value instanceof \Illuminate\View\ComponentSlot ? $value : $value !!}
            </div>
        @endif
    @endforeach

    {{-- Processa x-slots --}}
    @foreach($__laravel_slots ?? [] as $slotName => $slotContent)
        @if($slotName !== 'default')
            <div data-slot="{{ $slotName }}">
                {!! $slotContent instanceof \Illuminate\View\ComponentSlot ? $slotContent->toHtml() : $slotContent !!}
            </div>
        @endif
    @endforeach
</div>