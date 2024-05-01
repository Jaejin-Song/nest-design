import { setup, type Preview } from "@storybook/vue3";
import { install } from '../src/index';

import '../src/css/index.scss';

setup((app) => {
  app.use(install);
});

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
