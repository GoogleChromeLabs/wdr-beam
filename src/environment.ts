export const getEnvironments = (domain: string) => {
  const environment = {
    apiKey: 'AIzaSyBSBTYO-WYjfx_CicY_r0I-5qGoyj2K7hA',
    authDomain: 'chrome-gcs-uploader.firebaseapp.com',
    databaseURL: 'https://chrome-gcs-uploader.firebaseio.com',
    projectId: 'chrome-gcs-uploader',
    messagingSenderId: '561384360906',
    storageBucket: '',
    appId: '1:561384360906:web:e838a6ec0de9369989dd33',
  };

  switch (domain) {
    case 'developer.chrome.com':
      environment.storageBucket = 'chrome-gcs-uploader.appspot.com';
      break;
    case 'web.dev':
      environment.storageBucket = 'web-dev-uploads';
      break;
    default:
      throw new Error('No valid project selected');
  }
  return environment;
};
