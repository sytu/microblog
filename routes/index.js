var express = require('express'),
	router = express.Router(),
	crypto = require('crypto'),
	User = require('../models/user.js')
	Post = require('../models/post.js');

/* GET home page. */
router.get('/', function(req, res, next) {
	Post.get(null, function(err, posts) {
		if (err) {
			posts = [];
		}

		res.render('index', { 
			title: 'Welcome',
			posts: posts,
		 });
	})
});

router.get('/reg', checkNotLogin);
router.get('/reg', function(req, res, next) {
	res.render('reg', { title: 'Register!' })
});
router.get('/reg', checkNotLogin);
router.post('/reg', function(req, res, next) {
	if (req.body['password-repeat'] != req.body['password']) {
		req.flash('error', "Password didn't match.")
		return res.redirect('/reg');
	} 
	var md5 = crypto.createHash('md5');
	var password = md5.update(req.body.password).digest('base64');

	var newUser = new User({
		name: req.body.username,
		password: password,
	});

	User.get(newUser.name, function(err, user) {
		if (user) {
			err = 'User already exists.';
		}

		if (err) {
			req.flash('error', err);
			return res.redirect('/reg');
		}

		newUser.save(function(err) {
			if (err) {
				console.log(err);
				req.flash('error', err);
				return res.redirect('/reg');
			}

			req.session.user = newUser;
			req.flash('success', 'Registered Successfully')
			res.redirect('/');
		});
	});
});

router.get('/login', checkNotLogin);
router.get('/login', function(req, res, next) {
	res.render('login', { title: 'Login!' })
});
router.post('/login', function(req, res, next) {
	var md5 = crypto.createHash('md5');
	var password = md5.update(req.body.password).digest('base64');

	User.get(req.body.username, function(err, user) {
		if (!user) {
			req.flash('error', "User doesn't exists.")
			return res.redirect('/login');
		}

		if (password != user.password) {
			req.flash('error', "Sorry. Incorret password.")
			return res.redirect('/login');
		}

		req.session.user = user;
		req.flash('success', 'Logined Successfully')
		res.redirect('/');
	});
});

router.get('/logout', checkLogin);
router.get('/logout', function(req, res, next) {
	req.session.user = null;
	req.flash('success', 'Logout Successfully')
	res.redirect('/');
});

// router.post('/post', checkLogin);
// router.post('/post', function(req, res, next) {
// 	var currentuser  = req.session.user;
// 	var post = new Post(currentuser.name, req.body.post);
// 	post.save(function(err) {
// 		if (err) {
// 			req.flash('error', err);
// 			return res.redirect('/');
// 		}
// 		req.flash('success', 'Post Successfully');
// 		res.redirect('/u/' + currentuser.name);
// 	})
// });
router.post('post', checkLogin);
router.post('/post', function(req, res, next) { 
	var currentUser = req.session.user;
	var post = new Post(currentUser.name, req.body.post); 
	post.save(function(err) {
 		if (err) {
			req.flash('error', err);  
			return res.redirect('/');
 		}
		req.flash('success', '发表成功'); 
		res.redirect('/u/' + currentUser.name);
	});
}); 

router.get('/u/:user', function(req, res, next) {
	User.get(req.params.user, function(err, user) {
		if (!user) {
			req.flash('error', "User doesn't exists.");
			return	res.redirect('/');
		}

		Post.get(user.name, function(err, posts) {
			if (err) {
				req.flash('error', err);
				return	res.redirect('/');
			}

			res.render('user', {
				title: user.name,
				posts: posts,
			});
		})
	});
});

function checkNotLogin(req, res, next) {
	if (req.session.user) {
		req.flash('error', 'Already logined.')
		return res.redirect('/');
	}

	next();
}

function checkLogin(req, res, next) {
	if (!req.session.user) {
		req.flash('error', "Haven't logined yet.")
		return res.redirect('/');
	}

	next();
}



module.exports = router;
