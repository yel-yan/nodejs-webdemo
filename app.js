const koaLogger = require('koa-logger');

const Koa = require('koa');

const bodyParser = require('koa-bodyparser');

const controller = require('./controller');

const templating = require('./templating');

const rest = require('./middleware/rest');

const model = require('./model');

const app = new Koa();

// 配置控制台日志中间件
app.use(koaLogger());

const isProduction = process.env.NODE_ENV === 'production';

// log request URL:
app.use(async (ctx, next) => {
    console.log(`Process ${ctx.request.method} ${ctx.request.url}...`);
    var
        start = new Date().getTime(),
        execTime;
    await next();
    execTime = new Date().getTime() - start;
    ctx.response.set('X-Response-Time', `${execTime}ms`);
});

let
    Pet = model.Pet,
    User = model.User;

(async () => {
    var user = await User.create({
        name: 'John',
        gender: false,
        email: 'john-' + Date.now() + '@garfield.pet',
        passwd: 'hahaha',
        birth: '2007-07-07',
    });
    console.log('created: ' + JSON.stringify(user));
    var cat = await Pet.create({
        ownerId: user.id,
        name: 'Garfield',
        gender: false,
        birth: '2007-07-07',
    });
    console.log('created: ' + JSON.stringify(cat));
    var dog = await Pet.create({
        ownerId: user.id,
        name: 'Odie',
        gender: false,
        birth: '2008-08-08',
    });
    console.log('created: ' + JSON.stringify(dog));
})();

//  配置静态资源加载中间件
if (! isProduction) {
    let staticFiles = require('./static-files');
    app.use(staticFiles('/static/', __dirname + '/static'));
}

// 配置ctx.body解析中间件
app.use(bodyParser());

//  配置服务端末班渲染引擎中间件
app.use(templating('views', {
    noCache: !isProduction,
    watch: !isProduction
}));

// bind .rest() for ctx:
app.use(rest.restify());

//  初始化路由中间件
app.use(controller());

app.listen(3000);
console.log('app started at port 3000...');