const {
  LAUNCH_URL = 'http://localhost:5000',
  SELENIUM_HOST = 'localhost',
  SELENIUM_PORT = 4444,
} = process.env;

export = {
  src_folders: ['dist/tests'],
  output_folder: 'reports',
  custom_commands_path: '',
  custom_assertions_path: '',
  page_objects_path: '',
  globals_path: '',
  test_workers: {
    enabled: true,
    workers: 'auto',
  },

  selenium: {
    start_process: false,
    server_path: '',
    log_path: '',
    port: 4444,
    cli_args: {
      'webdriver.chrome.driver': '',
      'webdriver.gecko.driver': '',
      'webdriver.edge.driver': '',
    },
  },

  test_settings: {
    default: {
      launch_url: LAUNCH_URL,
      selenium_port: SELENIUM_PORT,
      selenium_host: SELENIUM_HOST,
      silent: true,
      screenshots: {
        enabled: false,
        path: '',
      },
      desiredCapabilities: {
        browserName: 'chrome',
      },
    },

    nojs: {
      desiredCapabilities: {
        chromeOptions: {
          prefs: {
            'profile.managed_default_content_settings.javascript': 2,
          },
        },
      },
    },

    firefox: {
      desiredCapabilities: {
        browserName: 'firefox',
        marionette: true,
      },
    },

    edge: {
      desiredCapabilities: {
        browserName: 'MicrosoftEdge',
      },
    },
  },
};
