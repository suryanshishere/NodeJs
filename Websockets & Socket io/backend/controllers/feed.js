const { validationResult } = require('express-validator');
const Post = require('../models/post');
const fs = require('fs');
const path = require('path');
const User = require('../models/user');
const io = require('../socket');

// ------------------ Fetch a posts --------------------

exports.getPosts = async (req, res, next) => {

    const currentPage = req.query.page || 1;
    const perPage = 2;

    try {
        const totalItems = await Post.find().countDocuments();
        const posts = await Post.find()
            .populate('creator')
            .sort({createdAt: -1})
            .skip((currentPage - 1) * perPage)
            .limit(perPage);

        res.status(200).json({
            message: 'Fetched posts successfully.',
            posts: posts,
            totalItems: totalItems,
        });
    } catch (err) {
        next(err);
    }
}


// ------------------ Create Post ----------------------

exports.createPost = async (req, res, next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect!');
        error.statusCode = 422;
        throw error;
    }
    if (!req.file) {
        const error = new Error('No image provided.');
        error.statusCode = 422;
        throw error;
    }

    const title = req.body.title;
    const content = req.body.content;
    const imageUrl = req.file.path;

    const post = new Post({
        title: title,
        content: content,
        imageUrl: imageUrl,
        creator: req.userId,
    })

    try {
        await post.save()
        const user = await User.findById(req.userId);
        user.posts.push(post);
        await user.save();

        io.getIO().emit('posts',{action: 'create', post:{...post._doc, creator: {_id: req.userId, name:user.name}}});

        res.status(201).json({
            message: 'Post created successfully!',
            post: post,
            creator: { _id: creator._id, name: creator.name }
        })
    }
    catch (err) {
        next(err);
    }
}


// --------------------Get a Post----------------------

exports.getPost = (req, res, next) => {
    const postId = req.params.postId;

    Post.findById(postId)
        .then(post => {
            if (!post) {
                const error = new Error('Could not find post.');
                error.statusCode = 404;
                throw error;
            }
            res.status(200)
                .json({
                    message: 'Post fetched.',
                    post: post
                });
        })
        .catch(err => {
            next(err);
        })
}


// ---------------------Edit a post---------------------


exports.editPost = (req, res, next) => {
    const postId = req.params.postId;
    const title = req.body.title;
    const content = req.body.content;
    let imageUrl = req.body.image;

    if (req.file) {
        imageUrl = req.file.path;
    }

    if (!imageUrl) {
        const error = new Error('No file picked.');
        error.statusCode = 422;
        throw error;
    }

    Post.findById(postId).populate('creator')
        .then(post => {
            if (!post) {
                const error = new Error('Could not find post.');
                error.statusCode = 404;
                throw error;
            }

            if (post.creator._id.toString() !== req.userId) {
                const error = new Error('Not authorised!');
                error.statusCode = 403;
                throw error;
            }

            if (imageUrl !== post.imageUrl) {
                clearImage(post.imageUrl);
            }
            post.title = title;
            post.imageUrl = imageUrl;
            post.content = content;
            return post.save();
        })
        .then(result => {
            io.getIO().emit('posts',{action: 'update', post:result})
            res.status(200).json({ message: 'Post updated!', post: result });
        })
        .catch(err => {
            next(err);
        })
}

// Clear a image.

const clearImage = filePath => {
    filePath = path.join(__dirname, '..', filePath);
    fs.unlink(filePath, err => console.log(err));
}


// ---------------- Delete a post-----------------------

exports.deletePost = (req, res, next) => {

    const postId = req.params.postId;

    Post.findById(postId)
        .then(post => {
            if (!post) {
                const error = new Error('Could not find post.');
                error.statusCode = 404;
                throw error;
            }

            if (post.creator.toString() !== req.userId) {
                const error = new Error('Not authorised!');
                error.statusCode = 403;
                throw error;
            }
            // Check logged in user.
            clearImage(post.imageUrl);
            return Post.findByIdAndDelete(postId);
        })
        .then(result => {
            return User.findById(req.userId);

        })
        .then(user => {
            user.posts.pull(postId);
            return user.save();
        })
        .then(result => {
            io.getIO().emit('posts',{action:'delete', post:postId});
            res.status(200).json({ message: 'Deleted post.' });
        })
        .catch(err => {
            next(err);
        })
}