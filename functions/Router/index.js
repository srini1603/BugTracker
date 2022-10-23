const { response, request } = require('express');
var express = require('express');
var catalyst = require('zcatalyst-sdk-node')
var bodyParser = require('body-parser')

const DETAILS = require('./details.json')

const DATAS = require('./helper/DATAS')
const USER = require('./helper/USER');
const { ZCQL } = require('zcatalyst-sdk-node/lib/zcql/zcql');
app = express()

app.use(bodyParser.urlencoded({ extended: false }))

app.use(bodyParser.json())


app.get('/',(req,res)=>{
	const cata = catalyst.initialize(req);
	dataPromise = cata.zcql().executeZCQLQuery(
		`SELECT ${DETAILS.BUG_DB}.*,${DETAILS.PROJECT_DB}.project_name,${DETAILS.EMPLOYEE_DB}.user_name  from ${DETAILS.BUG_DB} 
		inner join ${DETAILS.PROJECT_DB} on ${DETAILS.BUG_DB}.project_id = ${DETAILS.PROJECT_DB}.ROWID 
		inner join ${DETAILS.EMPLOYEE_DB} on ${DETAILS.BUG_DB}.issued_by = ${DETAILS.EMPLOYEE_DB}.ROWID;`)
	
	dataPromise.then( data=>{
		// console.log(data)
		zcl = cata.zcql().executeZCQLQuery(`SELECT * from employee`)
		zcl.then((next_data)=>{
			temp_data = {}
			for(i of next_data){
				temp_data[i.employee.ROWID] = i.employee.user_name
			}
			for(i in data){

				if(data[i].bug.assigned_to != null){
					data[i].bug["assigned_to_name"] = temp_data[data[i].bug.assigned_to]
				}
				else{
					data[i].bug["assigned_to_name"] = null
				}
				data[i].bug["issued_by_name"] = data[i].employee.user_name
				data[i].bug["project_name"] = data[i].project.project_name
			}
			return res.send(data)
		})
		
	})
	dataPromise.catch((e)=>{
		console.log(e)
		response.status(400)
		return res.send({"message":"could not able to post"})
	})
})

///
app.get('/projectUser',(req,res)=>{

	const cata = catalyst.initialize(req);
	const id = req.query.id;
	const team_lead_query = `select * from ${DETAILS.EMPLOYEE_DB} join project on ${DETAILS.EMPLOYEE_DB}.ROWID = ${DETAILS.PROJECT_DB}.team_lead_row_id  where ${DETAILS.PROJECT_DB}.ROWID = ${id};`
	let zcql = cata.zcql();
	let zcqlPromise = zcql.executeZCQLQuery(team_lead_query);

	zcqlPromise.then((queryResult) => {
      const team_lead_id = queryResult[0].employee.ROWID;
	  let query = `select * from employee where team_lead_id = ${team_lead_id};`
	  let result = zcql.executeZCQLQuery(query)
	  result .then(async user_id=>{
		return res.send(user_id)
	  })
	  result.catch(e=>{
		console.log(e)
	  })
	});

	zcqlPromise.catch((e)=>{
		console.log(e)
	})
})

app.get('/AllProjectDetails',(req,res)=>{
	const cata = catalyst.initialize(req);
	const query = `select * from ${DETAILS.PROJECT_DB}`
	cata.zcql().executeZCQLQuery(query)
	.then((data)=>{
		return res.send(data)
	})
})

app.post('/',(req,res)=>{

	const data = DATAS(req.body)
	const user_id = req.body.issued_by_user_id
	let query = `select ROWID from ${DETAILS.EMPLOYEE_DB} where auth_id = ${user_id}`
	const cata = catalyst.initialize(req);
	const zcql = cata.zcql().executeZCQLQuery(query)
	zcql.then((response)=>{
		data.issued_by = response[0].employee.ROWID
		const db = cata.datastore();
		let table = db.table(DETAILS.BUG_DB);

		let insertPromise = table.insertRow(data);
		insertPromise.then(()=>{
			return res.send({"status":200})
	})
	insertPromise.catch((e)=>{
		console.log(e)
		response.status(400)
		return res.send({"message":"could not able to post"})
	})
	})
})

app.put('/',(req,res)=>{

	const data = DATAS(req.body)
	if(data.assigned_to){
		data.assigned = true
	}
	const cata = catalyst.initialize(req);
	let datastore = cata.datastore();
    let table = datastore.table(DETAILS.BUG_DB);

    let rowPromise = table.updateRow(data);
    rowPromise.then((row) => {
			res.status(200)
			return res.send({"status":200})
        });
	rowPromise.catch((e=>{
		console.log(e);
		res.status(400);
		return res.send({"message":"did'nt updated"})
	}))
	
})



module.exports = app