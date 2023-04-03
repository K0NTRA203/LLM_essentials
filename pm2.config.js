module.exports = {
    apps: [
      {
        name: "flask-app",
        script: "app.py",
        interpreter: "python",
        instances: "max",
        exec_mode: "cluster",
        env: {
          FLASK_ENV: "production",
          FLASK_APP: "app.py",
        },
      },
    ],
  };