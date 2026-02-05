import type { PiniaPluginContext } from 'pinia';
import { klona } from 'klona/full';

/**
 * The plugin reset the state of the store which is written by setup syntax
 *
 * @param context
 */
export function resetSetupStore(context: PiniaPluginContext) {
  const { $state } = context.store;

  const defaultStore = klona($state);

  context.store.$reset = () => {
    context.store.$patch(defaultStore);
  };
}
