<!-- examples/views/test.blade.php -->
<div class="container">
    {{-- Componente Simples --}}
    @react('simple-component')
    
    {{-- Componente com Slots --}}
    <x-react name="card-component" :props="['title' => 'Meu Card']">
        <x-slot name="header">
            <h3>Header Customizado</h3>
        </x-slot>
        
        <p>Conteúdo Principal</p>
        
        <x-slot name="footer">
            <button>OK</button>
        </x-slot>
    </x-react>
    
    {{-- Componente com Lib Externa --}}
    @react('form-with-library')
</div>

@push('scripts')
<script>
    blade.listen('form:validated', ({ isValid }) => {
        console.log('Form validado:', isValid);
    });
</script>
@endpush