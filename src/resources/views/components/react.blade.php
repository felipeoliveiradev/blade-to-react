@props(['component', 'props' => []])

<div data-blade-react="{{ $component }}"
     @foreach($props as $key => $value)
         data-prop-{{ Str::kebab($key) }}="{{ is_string($value) ? $value : json_encode($value) }}"
        @endforeach
>
    <div class="react-content"></div>

    @if(isset($componentSlots) && count($componentSlots) > 0)
        <template data-slot-container>
            @foreach($componentSlots as $name => $slotContent)
                @if($slotContent->isNotEmpty())
                    <div data-slot="{{ $name }}">{{ $slotContent }}</div>
                @endif
            @endforeach
        </template>
    @endif

    <template data-child-container>
        {{ $slot }}
    </template>
</div>