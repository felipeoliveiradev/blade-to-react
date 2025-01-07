<?php

namespace BladeToReact\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Blade;
use Illuminate\Support\Facades\View;

class BladeReactServiceProvider extends ServiceProvider
{
    private bool $hasReactComponents = false;

    public function register()
    {
        $this->mergeConfigFrom(
            dirname(__DIR__) . '/config/blade-to-react.php', 'blade-to-react'
        );
    }

    public function boot()
    {
        // Primeiro carregar as views
        $this->loadViewsFrom(dirname(__DIR__) . '/resources/views', 'blade-react');

        // Publicar assets
        $this->publishes([
            dirname(__DIR__) . '/config/blade-to-react.php' => config_path('blade-to-react.php'),
            dirname(__DIR__) . '/resources/views' => resource_path('views/vendor/blade-react'),
        ], 'blade-to-react');

        // Registrar diretiva @react
        Blade::directive('react', function ($expression) {
            $this->hasReactComponents = true;
            
            $parts = explode(',', $expression, 2);
            $component = trim($parts[0], "'\"");
            $props = isset($parts[1]) ? trim($parts[1]) : '[]';

            return "<?php echo view('blade-react::components.react', [
                'component' => '{$component}',
                'props' => {$props}
            ])->render(); ?>";
        });

        // Registrar componente blade x-react (agora usando o namespace correto)
        Blade::component('blade-react::react', 'react');
        View::composer("blade-react::*", function($view) {
            $component = $view->getData()['__laravel_slots'] ?? [];
            $view->with('componentSlots', $component);
        });
        // Compartilhar variável
        View::composer('*', function ($view) {
            $view->with('hasReactComponents', $this->hasReactComponents);
           
        });

        // Debug para desenvolvimento
        if ($this->app->environment('local')) {
            $viewPath = dirname(__DIR__) . '/resources/views/components/react-wrapper.blade.php';
            if (!file_exists($viewPath)) {
                throw new \Exception("React wrapper view not found at: {$viewPath}");
            }
        }
    }
}
