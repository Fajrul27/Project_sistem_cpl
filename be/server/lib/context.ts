import { AsyncLocalStorage } from 'async_hooks';

interface Context {
    userId?: string;
}

export const context = new AsyncLocalStorage<Context>();

export const getContext = () => {
    return context.getStore();
};
