const express = require('express')
const catalyst = require('zcatalyst-sdk-node')

const DETAILS = require('./details.json')

app = express()

app.get('/',(req,res)=>{
	let FileId = req.query.id
	const cata = catalyst.initialize(req)
	let filestore = cata.filestore();
	let folder = filestore.folder(DETAILS.FOLDER);
	let downloadPromise = folder.downloadFile(FileId);
	downloadPromise.then((fileObject) => {
			res.contentType('image/jpeg');
    		res.send(Buffer.from(fileObject, 'binary'))
        });
	downloadPromise.catch((e)=>{console.log(e)
	res.status(400)
	res.send({"message":"refer logs"})})
	
})

module.exports = app