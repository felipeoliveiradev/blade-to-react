<?php

namespace BladeToReact;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Blade;
use Illuminate\Support\Facades\View;

class BladeReactServiceProvider extends ServiceProvider
{
    private bool $hasReactComponents = false;

    public function register()
    {
        $this->mergeConfigFrom(
            __DIR__ . '/config/blade-to-react.php', 'blade-to-react'
        );
    }

    public function boot()
    {
        // Publicar configuração
        $this->publishes([
            __DIR__ . '/config/blade-to-react.php' => config_path('blade-to-react.php'),
            __DIR__ . '/resources/views' => resource_path('views/vendor/blade-to-react'),
        ], 'blade-to-react');

        // Registrar diretiva @react
        Blade::directive('react', function ($expression) {
            $this->hasReactComponents = true;
            
            $parts = explode(',', $expression);
            $name = trim($parts[0]);
            array_shift($parts);
            $props = implode(',', $parts);
            
            return "<?php echo view('blade-react::components.react-wrapper', [
                'component' => $name,
                'props' => $props
            ])->render(); ?>";
        });

        // Registrar componente blade x-react
        Blade::component('blade-react::components.react', 'react');

        // Compartilhar variável com todas as views
        View::composer('*', function ($view) {
            $view->with('hasReactComponents', $this->hasReactComponents);
        });

        // Carregar views
        $this->loadViewsFrom(__DIR__ . '/resources/views', 'blade-react');
    }
}
