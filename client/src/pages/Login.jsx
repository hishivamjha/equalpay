import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api'

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState({})

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }


  const validateForm = () => {
      const errors = {}
      let valid=true;

      if (!formData.email) {
        errors.email = 'Email is required'
        valid=false;

      }

      if (!formData.password) {
        errors.password = 'Password is required'
        valid=false;
      }

      setErrors(errors)
      return valid;
  
}
  

const handleSubmit = (e) => {
  e.preventDefault()
  if(validateForm()){
    console.log('Login:', formData)
    api.post(`/login`,formData).then((res)=>{
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("username", res.data.username);
      localStorage.setItem("email", formData.email);
        navigate("/panel");
      })
      .catch((error)=>{
        setErrors({
          message: error.response?.data?.message || "Something went wrong",
        });
      })
    }
  else{
    console.log("empty")
  }
}

return (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center">

    <div className="w-[1100px] h-[700px] bg-white rounded-[32px] shadow-xl overflow-hidden flex border border-slate-200">


      <div className="w-1/2 bg-gradient-to-br from-slate-600 via-slate-500 to-emerald-700 text-white px-16 flex flex-col justify-center">

        <h1 className="text-4xl font-black tracking-tight mb-10">
          EqualPay
          <span className="text-emerald-400">.</span>
        </h1>

        <h1 className="text-5xl font-extrabold leading-tight">
          Welcome
          <br />
          back to
          <br />
          EqualPay.
        </h1>

        <p className="mt-6 text-lg text-slate-200 leading-8">
          Sign in to continue managing shared expenses
          with your friends, family and roommates.
        </p>

      </div>


      <div className="w-1/2 flex items-center justify-center bg-white">

        <div className="w-[420px]">

          <h2 className="text-4xl font-extrabold text-slate-900">
            Welcome Back
          </h2>

          <p className="text-slate-500 mt-2 mb-8">
            Sign in to your account.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">


            <div>

              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                className="w-full h-12 px-4 rounded-xl border border-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 transition"
              />

              {errors.email && (<p className="text-red-500 text-sm mt-1">{errors.email}</p>)}


            </div>


            <div>

              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Password
              </label>

              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full h-12 px-4 rounded-xl border border-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 transition"
              />

              {errors.password && (<p className="text-red-500 text-sm mt-1">{errors.password}</p>)}

            </div>

            <div className="flex justify-end">

              <button
                type="button"
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Forgot Password?
              </button>

            </div>
            {errors.message && (<p className="text-red-500 text-sm mt-1">{errors.message}</p>)}
            <button
              type="submit"
              className="w-full h-12 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all duration-300 shadow-lg shadow-indigo-500/30"
            >
              Sign In
            </button>

          </form>

          <p className="text-center text-slate-600 mt-8">
            Don't have an account?

            <Link
              to="/signup"
              className="ml-2 text-indigo-600 font-semibold hover:text-indigo-700"
            >
              Create Account
            </Link>

          </p>

        </div>

      </div>

    </div>

  </div>
);
}

export default Login
