const DATAS = (value) =>{
    const {ROWID,name,description,attachment,actually_solved_date,assigned,assigned_to	
		,completed,deadline,issued_by,project_id,status} = value

	let column_name_arr = [ROWID,name,description,attachment,actually_solved_date,assigned,assigned_to,completed,deadline,issued_by,project_id,status]
	let column_name_temp_arr = ["ROWID","name","description","attachment","actually_solved_date","assigned","assigned_to","completed","deadline","issued_by","project_id","status"]

	const data = {}
	
	for(let i in column_name_arr){
		if(column_name_arr[i]!= undefined) {
			data[column_name_temp_arr[i]] = column_name_arr[i]
		} 
	}

    return data
}

module.exports = DATAS