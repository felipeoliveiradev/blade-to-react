<div 
    data-blade-react="{{ $component }}"
    @foreach($props as $key => $value)
        data-prop-{{ Str::kebab($key) }}="{{ is_string($value) ? $value : json_encode($value) }}"
    @endforeach
>
    {{ $slot ?? '' }}
</div>