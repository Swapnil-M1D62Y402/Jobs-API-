const Job = require('../models/Job');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, NotFoundError } = require('../errors');


const getAllJobs = async (req, res) => { 
    //we are looking for the jobs that are associated with the user only 
    const user_jobs = await Job.find({ createdBy: req.user.userID }).sort('createdAt');
    res.status(StatusCodes.OK).json({ username: req.user.name ,user_jobs, count: user_jobs.length });
}

const getJob = async (req, res) => { 
    //here we are destructuring req object and specifically we are getting 
    //userID from req.user and jobID from req.params
    const { user: { userID }, params: { id: jobID} } = req;
    const user_job = await Job.findOne({
        _id: jobID,
        createdBy:userID
    });

    if (!user_job) {
        throw new NotFoundError(`No job exists with id ${jobID}`);
    }
    else { 
        res.status(StatusCodes.OK).json({user_job});
    }
}

const createJob = async (req, res) => { 
//we are creating a new field in the req.body and inputing the userID from req.user
    req.body.createdBy = req.user.userID;  
    const job = await Job.create(req.body);
    console.log(job);
    res.status(StatusCodes.CREATED).json({ job: job });
}

const updateJob = async (req, res) => { 
    const {
        body: { company, position },
        user: { userID },
        params: { id: jobID}
    } = req;

    if (company === '' || position === '') { 
        throw new BadRequestError('Company and Position fields cannot be empty');
    }

    const job = await Job.findByIdAndUpdate({
        _id: jobID,
        createdBy: userID
    },
        req.body,     //make sure to pass the req.body or else it wont update
        {new: true, runValidators: true}
    )
    if (!job) { 
        throw new NotFoundError(`No job exist with ID: ${jobID}`);
    }
    res.status(StatusCodes.OK).json(job);
}

const deleteJob = async (req, res) => { 
    const {
        user: { userID },
        params: { id: jobID }
    } = req;

    const job = await Job.findByIdAndRemove({
        _id: jobID,
        createdBy: userID
    })
    if (!job) {
        throw new NotFoundError(`No job found with id : ${jobID}`);
    }
    else { 
        res.status(StatusCodes.OK);
    }
}

module.exports = {
    getAllJobs,
    getJob,
    createJob,
    updateJob,
    deleteJob
}