<!-- create-client.blade.php -->
<form id="clientForm" method="POST" action="{{ route('clients.store') }}">
    @csrf
    
    <!-- Campos normais do Blade -->
    <div class="form-group">
        <label>Nome</label>
        <input type="text" 
               name="name" 
               class="form-control @error('name') is-invalid @enderror" 
               value="{{ old('name') }}">
        @error('name')
            <div class="invalid-feedback">{{ $message }}</div>
        @enderror
    </div>

    <!-- Componente React com campos dinâmicos -->
    @react('form-fields', [
        'initialData' => old()
    ])

    <!-- Campos hidden que serão atualizados pelo React -->
    <input type="hidden" name="type" id="type">
    <input type="hidden" name="category" id="category">

    <button type="submit" 
            id="submitButton" 
            disabled 
            class="btn btn-primary">
        Salvar
    </button>
</form>

@push('scripts')
<script>
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('clientForm');
    const submitButton = document.getElementById('submitButton');

    // Escuta mudanças do React
    blade.listen('form:changed', ({ field, value, isValid }) => {
        // Atualiza campos hidden
        document.getElementById(field).value = value;
        
        // Valida formulário
        validateForm();
    });

    function validateForm() {
        const formData = blade.get('clientForm') || {};
        const name = document.querySelector('[name="name"]').value;
        
        // Regras de validação
        const isValid = 
            name.length > 0 &&
            formData.type &&
            formData.category;
        
        submitButton.disabled = !isValid;
    }

    // Validação dos campos Blade
    document.querySelectorAll('input[name]').forEach(input => {
        input.addEventListener('input', validateForm);
    });

    // Handle submit
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        try {
            const response = await fetch(form.action, {
                method: 'POST',
                body: new FormData(form),
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            const data = await response.json();

            if (!response.ok) {
                // Se houver erros de validação do backend
                if (data.errors) {
                    // Notifica o React sobre os erros
                    blade.emit('backend:validation', data.errors);
                    return;
                }
                throw new Error(data.message);
            }

            // Sucesso!
            blade.emit('form:reset');
            window.location.href = data.redirect;
            
        } catch (error) {
            console.error('Error:', error);
        }
    });
});
</script>
@endpush