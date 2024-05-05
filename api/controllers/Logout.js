const Logout = async(req,res)=>{
    res.cookie("token", "").json("ok");
}

export default Logout;