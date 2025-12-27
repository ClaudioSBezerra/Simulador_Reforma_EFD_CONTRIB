
/**
 * Fiscal Analytics - Simulador de Reforma Tributária
 * Este sistema utiliza uma estrutura de dados robusta no Supabase.
 * O script completo de banco de dados (Tabelas, RLS, Views, Alíquotas)
 * encontra-se no arquivo 'schema.sql'.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
    throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
