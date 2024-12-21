#!/bin/bash

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

if [ ! -f "artisan" ]; then
    echo -e "${RED}Erro: Este não é um projeto Laravel!${NC}"
    exit 1
fi

echo -e "${YELLOW}Instalando blade-to-react...${NC}"

# Instalar pacotes
composer require blade-to-react/laravel
npm install @blade-to-react/core

# Publicar assets
php artisan vendor:publish --tag=blade-to-react --force

# Criar diretório de componentes
mkdir -p resources/js/components/react

# Criar exemplo
cat > resources/js/components/react/Example.tsx << 'END'
import React from 'react';
import { BladeComponent } from '@blade-to-react/core';

@BladeComponent('example')
export class Example extends React.Component {
    render() {
        return (
            <div className="p-4 bg-white shadow rounded">
                <h2 className="text-xl mb-4">Exemplo de Componente</h2>
                <p>Este é um componente React renderizado via Blade!</p>
            </div>
        );
    }
}
END

# Adicionar ao app.js
echo "import '@blade-to-react/core';" >> resources/js/app.js
echo "import './components/react/Example';" >> resources/js/app.js

# Criar view de exemplo
cat > resources/views/react-example.blade.php << 'END'
@extends('layouts.app')

@section('content')
    <div class="container mx-auto p-4">
        <h1 class="text-2xl mb-6">Teste do blade-to-react</h1>
        
        {{-- Usando diretiva --}}
        @react('example')
        
        {{-- Usando componente --}}
        <x-react name="example" :props="['title' => 'Meu Título']">
            <div data-slot="header">
                Cabeçalho Customizado
            </div>
        </x-react>
    </div>
@endsection
END

echo -e "${GREEN}Instalação concluída!${NC}"
echo -e "${YELLOW}Adicione esta rota para testar:${NC}"
echo "Route::get('/react-example', fn() => view('react-example'));"
