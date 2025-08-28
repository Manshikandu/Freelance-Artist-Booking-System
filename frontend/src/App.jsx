import React, { useEffect } from "react";

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Login from "./pages/Login"
import ClientSignUp from "./pages/ClientSignUp"
import ArtistSignUp from "./pages/ArtistSignUp";
import SignUpSelect from "./pages/SignUpSelect";

import HomePage from "./pages/HomePage";
import About from "./pages/About";
import ArtistDashboard from "./pages/ArtistDashboard";


import ClientPostsPage from "./pages/ClientPostsPage";
import CreatePostPage from "./pages/CreatePostPage";
 

import ArtistBookingForm from "./pages/ArtistBooking";
import MyBookings from "./pages/MyBookings";


import { Toaster } from "react-hot-toast";
import PrivateRoute from "./pages/PrivateRoute";

import ArtistProfilee from "./pages/ArtistPages";

import ArtistHome from "./pages/Artist/ArtistHomepage";
import EditArtist from "./pages/EditArtist";
import ArtistPostPage from "./pages/ArtistPostPage";
import ArtistsList from "./pages/ArtistList";
import ArtistProfileView from "./pages/Client/ArtistProfileView";
import ArtistSideBooking from "./pages/Artist/ArtistSideBooking";


//contract
import GenerateContractPage from './pages/ContractPage';


//apply
import ApplyJob from "./pages/ApplyJob";

//recommendations
import ArtistRecommendations from "./pages/ArtistRecommendations";


//reset
import ResetPasswordPage from "./pages/ResetPasswordPage";


//forget
import ForgotPasswordPage from "./pages/ForgetPasswordPage";

import ProtectedAdminRoute from "./Admin_frontend/ProtectedAdminRoute";
import AdminLogin from "./Admin_frontend/AdminLogin";
import Artist from "./Admin_frontend/pages/Artist";
import Dashboard from "./Admin_frontend/pages/Dashboard";
import Client from "./Admin_frontend/pages/Client";
import AdminLayout from "./Admin_frontend/Components/AdminLayout";

import ClientProfilePage from "./pages/Client/ClientProfilePage";
import AdminVerifyArtists from "./Admin_frontend/Components/AdminVerifyArtists";
import AdminAllBookings from "./Admin_frontend/pages/AllBooking";
import AdminSignedContracts from "./Admin_frontend/pages/AdminSignedContract";
import RecentVerifiedArtists from "./Admin_frontend/pages/RecentVerifiedArtist";


import ArtistSignPage from "./pages/ArtistSignPage";

import NotificationPage from './pages/NotificationPage';

import PaymentSuccess from "./pages/PaymentSuccess";


import ConfirmCompletionPaymentPage from "./pages/PaymentConfirmPage";
import PaymentReceipt from "./pages/PaymentReceipt"; 

import SearchResult from "./pages/SearchResult";
import CancelBooking from "./pages/CancelBooking";


//chat 
import ChatContainer from './ChatApp/components/ChatContainer';
 import ArtistChatPage from './ChatApp/Pages/ArtistChatPage';
 import ProtectedRoute from './lib/ProtectRoute';
import { useUserStore } from "./stores/useUserStore";

function App() {
  const { user,  connectSocket } = useUserStore();

  // useEffect(() => {
  //   checkAuth();
  // }, []);

  useEffect(() => {
    if (user) connectSocket();
  }, [user]);

  return (

    <div >
      <Router>
        <Routes>
          <Route path="/" element = { <HomePage />} />
          <Route path="/login" element = { <Login />} />
          <Route path="/clientSignup" element = { <ClientSignUp /> } />
          <Route path="/artistSignup" element={<ArtistSignUp />} />
          <Route path="/signup-select" element={<SignUpSelect />} />
          <Route path="/about" element={<About />} />
          <Route path="/profile" element={<PrivateRoute><ArtistProfilee /></PrivateRoute>} />
          <Route path="/editartist" element={<PrivateRoute><EditArtist /></PrivateRoute>} />
          
          <Route path="/artistdash" element={<PrivateRoute> <ArtistDashboard /> </PrivateRoute>} />
          <Route path="/artisthome" element={<ArtistHome />} />


          <Route path="/createpost" element={<CreatePostPage />} />

          <Route path="/posts" element={<ClientPostsPage />} />


          <Route path="/post" element={<ArtistPostPage/>} />

          <Route path="/category/:categoryName" element={<ArtistsList />} />
          <Route path="artist/:id" element={<ArtistProfileView />} />



          {/* //clientside booking */}
          <Route path="/book" element={<ArtistBookingForm/>} />
           <Route path="/my-bookings" element={<MyBookings/>} />
           <Route path="/booking/cancel/:bookingId" element={<CancelBooking />} />

           {/* //artistsidebooking */}
           <Route path="/artist-bookings" element={<ArtistSideBooking />} />


           {/* //contract */}
           <Route path="/generate-contract/:bookingId" element={<GenerateContractPage />} />


          {/* //recommendations */}
            <Route path="/recommendations" element={<ArtistRecommendations />} />

          {/* //apply.jsx */}
          <Route path="/apply/:id" element={<ApplyJob />} />


          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />


         <Route path="/admin-login" element={<AdminLogin />} />

       
    
           <Route path="/admin/*" element={<ProtectedAdminRoute><AdminLayout /></ProtectedAdminRoute>}>
    

              
            <Route index element={<Dashboard /> }/>
            <Route path="artists" element={<Artist /> }/> 
            <Route path="clients" element={<Client /> }/> 
            
            <Route path="bookings" element={<AdminAllBookings />} />
            <Route path="contracts" element={<AdminSignedContracts />} />
            <Route path="verify-artists" element={<AdminVerifyArtists />} />
            <Route path="recent-verified-artists" element={<RecentVerifiedArtists />} />


          </Route>

            <Route path="clientp" element={<ClientProfilePage />} />

           <Route path="/contracts/artist-sign/:bookingId" element={<ArtistSignPage />} />

          <Route path="/notifications" element={<NotificationPage />} />

           <Route path="/payment/success" element={<PaymentSuccess />} />

            <Route path="/booking/confirm-completion/:id" element={<ConfirmCompletionPaymentPage />} />


          
            <Route path="/payments/receipt/:id" element={<PaymentReceipt />} />

            <Route path="/search" element={<SearchResult />} />


              <Route path="/chat" element={<ChatContainer />} />

                    <Route path="/ArtistChat" element={
                      <ProtectedRoute allowedRoles={["artist"]}>
                        <ArtistChatPage />
                      </ProtectedRoute>
                      }
                      />


        </Routes>     
     
        
      </Router> 
      
      <Toaster />      
    </div>
       
      
  )
}

export default App


