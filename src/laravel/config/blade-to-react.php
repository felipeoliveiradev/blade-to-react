<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Auto Initialize
    |--------------------------------------------------------------------------
    |
    | Automatically initialize blade-to-react when @react directive is used
    |
    */
    'auto_init' => true,

    /*
    |--------------------------------------------------------------------------
    | Debug Mode
    |--------------------------------------------------------------------------
    |
    | Enable debug mode to see detailed logs
    |
    */
    'debug' => env('APP_DEBUG', false),

    /*
    |--------------------------------------------------------------------------
    | Default Props
    |--------------------------------------------------------------------------
    |
    | Default props to pass to all components
    |
    */
    'default_props' => [
        // 'prop_name' => 'value'
    ],

    /*
    |--------------------------------------------------------------------------
    | Integrations
    |--------------------------------------------------------------------------
    |
    | Configure integrations with other libraries
    |
    */
    'integrations' => [
        'jquery' => true,
        'jquery_validation' => true,
        'select2' => false,
    ],
];
