
const USER = async (app,data) =>{

let userManagement = app.userManagement();

    for(i of data){
        let assigin_id = i.bug.assigned_to
        i.bug.assigin_id = assigin_id
        id = i.bug.issued_by
        if(id!=null){
            let userPromise = userManagement.getUserDetails(id);
            await userPromise.then((userDetails) => {
                i.bug.issued_by = userDetails.first_name +" "+userDetails.last_name;  
            });
            userPromise.catch((e)=>console.log(e))
        }
        if(assigin_id!=null){
            let userPromise = userManagement.getUserDetails(assigin_id);
            await userPromise.then((userDetails) => {
                i.bug.assigned_to = userDetails.first_name +" "+userDetails.last_name;  
            });
            userPromise.catch((e)=>console.log(e))
        }
    }
return data

}

module.exports = USER