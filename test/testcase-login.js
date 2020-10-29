const Application = require('spectron').Application
const assert = require('assert')
const electronPath = require('electron') // Require Electron from the binaries included in node_modules.
const { contains } = require('jquery')
const path = require('path')

describe('Application launch', function () {
    this.timeout(30000)

    const app = new Application({
      path: electronPath,
      args: [path.join(__dirname, '..')]
    })

    before(function () {
      return app.start()
    })
  
    after(function () {
      if (app && app.isRunning()) {
        return app.stop()
      }
    })
  
    it('shows an initial window', function () {
      return app.client.getWindowCount().then(function (count) {
        assert.equal(count, 1)
      })
    })

    it('Login Test', async() => {
      var email = (await app.client.$('#username'));
      var password = (await app.client.$('#password'));
      var keep = (await app.client.$('#keep-login'));

      var login = (await app.client.$('#login'));

      await email.setValue('test@test.org');
      await password.setValue("testing");
      
      await keep.click();

      await keep.getValue().then((val) => {
        assert.equal(val, 'on');
      });

      await email.getValue().then((val) => {
        assert.equal(val, 'test@test.org');
      });

      await password.getValue().then((val) => {
        assert.equal(val, 'testing');
      });

      await login.click();
    })
  })