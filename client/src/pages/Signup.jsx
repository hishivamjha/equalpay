// import { useState } from 'react'
// import { Link, useNavigate } from 'react-router-dom'
// import api from '../api'

// function SignUp() {
//     const passwordRegex =/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[\]{};':"\\|,.<>\/?]).{8,}$/;
//     const [formData, setFormData] = useState({
//         name: '',
//         email: '',
//         password: '',
//         confirmPassword: '',
//     })

//     const [errors, setErrors] = useState({})
//     const navigate = useNavigate();


//     const validateForm = () => {
//         const errors = {}
//         let valid = true;

//         if (!formData.name) {
//             errors.name = 'Name is required'
//             valid = false;

//         }
//         if (!formData.email) {
//             errors.email = 'Email is required'
//             valid = false;

//         }
//         if (!formData.password) {
//             errors.password = 'Password is required'
//             valid = false;
//           } else if (
//             !passwordRegex.test(
//               formData.password
//             )
//           ) {
//             errors.password =
//               'Password must be at least 8 characters and include uppercase, lowercase, number, and special character'
//             valid = false;
//           }
//         if (!formData.confirmPassword) {
//             errors.confirmPassword = 'Confirm Password is required'
//             valid = false;
//         }
//         if (
//             formData.password &&
//             formData.confirmPassword &&
//             formData.password !== formData.confirmPassword
//         ) {
//             errors.confirmPassword = "Passwords do not match";
//             valid = false;
//         }
//         setErrors(errors)
//         return valid;

//     }

//     const handleChange = (e) => {
//         const { name, value } = e.target
//         setFormData((prev) => ({ ...prev, [name]: value }))
//     }

//     const handleSubmit = (e) => {
//         e.preventDefault()
//         if(validateForm()){
//           console.log('Login:', formData)
//           api.post(`/signup`,formData).then((res)=>{
//               navigate("/login");
//             })
//             .catch((error)=>{
//               setErrors({
//                 message: error.response?.data?.message || "Something went wrong",
//               });
//             })
//           }
//         else{
//           console.log("empty")
//         }
//       }
//     return (
//         <div className="min-h-screen bg-slate-50 flex items-center justify-center">

//             <div className="w-[1100px] h-[700px] bg-white rounded-[32px] shadow-xl overflow-hidden flex border border-slate-200">


//                 <div className="bg-slate-600  text-white px-16 flex flex-col justify-center">

//                     <h1 className="text-4xl font-black tracking-tight mb-10">
//                         EqualPay
//                         <span className="text-emerald-400">.</span>
//                     </h1>

//                     <h1 className="text-5xl font-extrabold leading-tight">
//                         Start splitting
//                         <br />
//                         expenses today.
//                     </h1>

//                     <p className="mt-6 text-lg text-indigo-100 leading-8">
//                     Create an account to track shared bills with
//                     friends, roommates, and family.
//                     </p>



//                 </div>


//                 <div className="w-1/2 flex items-center justify-center bg-white">

//                     <div className="w-[420px]">

//                         <h2 className="text-4xl font-extrabold text-slate-900">
//                             Create Account
//                         </h2>

//                         <p className="text-slate-500 mt-2 mb-8">
//                             Get started with your free account.
//                         </p>

//                         <form onSubmit={handleSubmit} className="space-y-5">

//                             <div>
//                                 <label className="block text-sm font-semibold text-slate-700 mb-2">
//                                     Full Name
//                                 </label>

//                                 <input
//                                     type="text"
//                                     name="name"
//                                     value={formData.name}
//                                     onChange={handleChange}
//                                     placeholder="Shivam kumar"
//                                     className="w-full h-12 px-4 rounded-xl border border-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 transition"
//                                 />

//                                 {errors.name && (<p className="text-red-500 text-sm mt-1">{errors.name}</p>)}
//                             </div>

//                             <div>
//                                 <label className="block text-sm font-semibold text-slate-700 mb-2">
//                                     Email
//                                 </label>

//                                 <input
//                                     type="email"
//                                     name="email"
//                                     value={formData.email}
//                                     onChange={handleChange}
//                                     placeholder="name@example.com"
//                                     className="w-full h-12 px-4 rounded-xl border border-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 transition"
//                                 />

//                                 {errors.email && (<p className="text-red-500 text-sm mt-1">{errors.email}</p>)}
//                             </div>

//                             <div>
//                                 <label className="block text-sm font-semibold text-slate-700 mb-2">
//                                     Password
//                                 </label>

//                                 <input
//                                     type="password"
//                                     name="password"
//                                     value={formData.password}
//                                     onChange={handleChange}
//                                     placeholder="••••••••"
//                                     className="w-full h-12 px-4 rounded-xl border border-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 transition"
//                                 />

//                                 {errors.password && (<p className="text-red-500 text-sm mt-1">{errors.password}</p>)}
//                             </div>

//                             <div>
//                                 <label className="block text-sm font-semibold text-slate-700 mb-2">
//                                     Confirm Password
//                                 </label>

//                                 <input
//                                     type="password"
//                                     name="confirmPassword"
//                                     value={formData.confirmPassword}
//                                     onChange={handleChange}
//                                     placeholder="••••••••"
//                                     className="w-full h-12 px-4 rounded-xl border border-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 transition"
//                                 />

//                                 {errors.confirmPassword && (<p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
//                                 )}
//                             </div>
//                             {errors.message && (<p className="text-red-500 text-sm mt-1">{errors.message}</p>)}
//                             <button
//                                 type="submit"
//                                 className="w-full h-12 rounded-xl bg-indigo-600 text-white font-medium transition hover:bg-indigo-700"
//                             >
//                                 Create Account
//                             </button>

//                         </form>

//                         <p className="text-center text-slate-600 mt-8">
//                             Already have an account?
//                             <Link to="/login" className="ml-2 text-indigo-600 font-semibold hover:text-indigo-700">
//                                 Sign In
//                             </Link>
//                         </p>

//                     </div>

//                 </div>

//             </div>

//         </div>
//     );
// }

// export default SignUp

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api'

function SignUp() {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    })

    const [errors, setErrors] = useState({})

    // --- New States for OTP Flow ---
    const [isOtpSent, setIsOtpSent] = useState(false)
    const [otp, setOtp] = useState('')
    const [otpToken, setOtpToken] = useState('')
    // -------------------------------

    const navigate = useNavigate();

    const validateForm = () => {
        const errors = {}
        let valid = true;

        if (!formData.name) {
            errors.name = 'Name is required'
            valid = false;
        }
        if (!formData.email) {
            errors.email = 'Email is required'
            valid = false;
        }
        if (!formData.password) {
            errors.password = 'Password is required'
            valid = false;
        } else if (!passwordRegex.test(formData.password)) {
            errors.password = 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character'
            valid = false;
        }
        if (!formData.confirmPassword) {
            errors.confirmPassword = 'Confirm Password is required'
            valid = false;
        }
        if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
            errors.confirmPassword = "Passwords do not match";
            valid = false;
        }
        setErrors(errors)
        return valid;
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (validateForm()) {
            api.post(`/signup`, formData)
                .then((res) => {
                    // Start OTP Flow instead of navigating
                    setOtpToken(res.data.otpToken);
                    setIsOtpSent(true);
                    setErrors({});
                })
                .catch((error) => {
                    setErrors({
                        message: error.response?.data?.message || "Something went wrong",
                    });
                })
        }
    }

    // --- New handler for OTP Submission ---
    const handleVerifyOTP = (e) => {
        e.preventDefault();
        if (!otp) {
            setErrors({ otp: 'Please enter the OTP' });
            return;
        }

        api.post('/verify-otp', { otp, otpToken })
            .then((res) => {
                // Verified successfully! Now go to login
                navigate("/login");
            })
            .catch((error) => {
                setErrors({
                    message: error.response?.data?.message || "Invalid OTP or Token expired",
                });
            });
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">

            <div className="w-[1100px] h-[700px] bg-white rounded-[32px] shadow-xl overflow-hidden flex border border-slate-200">

                <div className="bg-slate-600 text-white px-16 flex flex-col justify-center">
                    <h1 className="text-4xl font-black tracking-tight mb-10">
                        EqualPay
                        <span className="text-emerald-400">.</span>
                    </h1>

                    <h1 className="text-5xl font-extrabold leading-tight">
                        Start splitting
                        <br />
                        expenses today.
                    </h1>

                    <p className="mt-6 text-lg text-indigo-100 leading-8">
                        Create an account to track shared bills with
                        friends, roommates, and family.
                    </p>
                </div>

                <div className="w-1/2 flex items-center justify-center bg-white">

                    <div className="w-[420px]">

                        {/* Conditionally Render Headers Based on Flow */}
                        {!isOtpSent ? (
                            <>
                                <h2 className="text-4xl font-extrabold text-slate-900">
                                    Create Account
                                </h2>
                                <p className="text-slate-500 mt-2 mb-8">
                                    Get started with your free account.
                                </p>
                            </>
                        ) : (
                            <>
                                <h2 className="text-4xl font-extrabold text-slate-900">
                                    Verify Email
                                </h2>
                                <p className="text-slate-500 mt-2 mb-8">
                                    We sent a 6-digit code to <b>{formData.email}</b>.
                                </p>
                            </>
                        )}


                        {/* Form Area */}
                        {!isOtpSent ? (
                            /* --- Original Signup Form --- */
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Shivam kumar"
                                        className="w-full h-12 px-4 rounded-xl border border-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 transition"
                                    />
                                    {errors.name && (<p className="text-red-500 text-sm mt-1">{errors.name}</p>)}
                                </div>

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

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Confirm Password
                                    </label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        className="w-full h-12 px-4 rounded-xl border border-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 transition"
                                    />
                                    {errors.confirmPassword && (<p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>)}
                                </div>
                                {errors.message && (<p className="text-red-500 text-sm mt-1">{errors.message}</p>)}

                                <button
                                    type="submit"
                                    className="w-full h-12 rounded-xl bg-indigo-600 text-white font-medium transition hover:bg-indigo-700"
                                >
                                    Create Account
                                </button>
                            </form>
                        ) : (
                            /* --- New OTP Verification Form --- */
                            <form onSubmit={handleVerifyOTP} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Enter OTP
                                    </label>
                                    <input
                                        type="text"
                                        name="otp"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        placeholder="123456"
                                        className="w-full h-12 px-4 rounded-xl border border-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 transition text-center tracking-widest text-lg"
                                        maxLength={6}
                                    />
                                    {errors.otp && (<p className="text-red-500 text-sm mt-1">{errors.otp}</p>)}
                                </div>
                                {errors.message && (<p className="text-red-500 text-sm mt-1">{errors.message}</p>)}

                                <button
                                    type="submit"
                                    className="w-full h-12 rounded-xl bg-emerald-600 text-white font-medium transition hover:bg-emerald-700"
                                >
                                    Verify Email
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setIsOtpSent(false)}
                                    className="w-full h-12 mt-2 rounded-xl bg-slate-100 text-slate-600 font-medium transition hover:bg-slate-200"
                                >
                                    Cancel & Go Back
                                </button>
                            </form>
                        )}

                        <p className="text-center text-slate-600 mt-8">
                            Already have an account?
                            <Link to="/login" className="ml-2 text-indigo-600 font-semibold hover:text-indigo-700">
                                Sign In
                            </Link>
                        </p>

                    </div>
                </div>
            </div>
        </div>
    );
}

export default SignUp

