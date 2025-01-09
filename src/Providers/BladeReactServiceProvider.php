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
            __DIR__.'/../config/blade-to-react.php',
            'blade-to-react'
        );
    }

    public function boot()
    {
        $this->loadViewsFrom(__DIR__.'/../resources/views/components', 'blade-react');

        $this->publishes([
            __DIR__.'/../config/blade-to-react.php' => config_path('blade-to-react.php'),
            __DIR__.'/../resources/views/components' => resource_path('views/vendor/blade-react'),
        ], 'blade-to-react');

        // Registra a diretiva @react
        Blade::directive('react', function ($expression) {
            $this->hasReactComponents = true;

            // Parse mais robusto da expressão
            preg_match('/([^,]+)(?:,(.+))?/', $expression, $matches);
            $component = trim($matches[1] ?? '', "'\"");
            $props = isset($matches[2]) ? trim($matches[2]) : '[]';

            return "<?php echo view('blade-react::react', [
                'component' => '{$component}',
                'props' => {$props},
            ])->render(); ?>";
        });

        // Registra os componentes
        Blade::component('blade-react::react', 'react');
        Blade::component('blade-react::react-wrapper', 'react-wrapper');

        // Composer para processar slots
        View::composer("blade-react::*", function ($view) {
            $data = $view->getData();
            $slots = $data['__laravel_slots'] ?? [];
            $attributes = $data['attributes'] ?? [];

            // Adiciona informações extras ao view
            $view->with('componentSlots', $slots);
            $view->with('componentAttributes', $attributes);
        });

        // Composer global para flag de React
        View::composer('*', function ($view) {
            $view->with('hasReactComponents', $this->hasReactComponents);
        });

        // Verificação de arquivos em ambiente local
        if ($this->app->environment('local')) {
            $this->verifyRequiredFiles();
        }
    }

    private function verifyRequiredFiles()
    {
        $viewPaths = [
            __DIR__.'/../resources/views/components/react.blade.php',
            __DIR__.'/../resources/views/components/react-wrapper.blade.php'
        ];

        foreach ($viewPaths as $viewPath) {
            if (!file_exists($viewPath)) {
                throw new \Exception("React view not found at: {$viewPath}");
            }
        }
    }
}