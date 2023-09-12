import path from 'path';

function verifyPlugin(plugin) {
  console.log('plugin', plugin);
  if (!plugin || !plugin.name || typeof plugin.plugin !== 'function') {
    throw new Error(
      'Invalid plugin valid plugin must have a name and a plugin function'
    );
  }
}

async function loadPlugins(pluginFile) {
  let plugins = [];
  try {
    if (pluginFile) {
      const plugin = (await import(path.resolve(pluginFile)))?.default;
      if (Array.isArray(plugin)) {
        plugins = plugin.filter((p) => {
          try {
            verifyPlugin(p);
            return true;
          } catch (e) {
            console.warn(e);
            return false;
          }
        });
      } else {
        console.warn(
          'Plugins file must export an array of plugins. Ignoring the plugins file'
        );
      }
    }
  } catch (e) {
    console.warn('Unable to load plugins file. Ignoring the plugins file');
  }
  return plugins;
}

export default loadPlugins;
