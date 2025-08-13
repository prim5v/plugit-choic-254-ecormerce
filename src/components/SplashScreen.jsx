import React from 'react';
const SplashScreen = () => {
  return <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#f8f5f1] z-50">
      <div className="mb-6 animate-pulse">
        <img src="/528819492_1144764417483656_3381559210680013388_n.jpg" alt="Home Logo" className="w-32 h-32 rounded-full" />
      </div>
      <h1 className="text-3xl font-bold text-[#8c5e3b] mb-2">
        Plug.It.Choice_254
      </h1>
      <p className="text-[#5a3921] text-lg">powered by home</p>
    </div>;
};
export default SplashScreen;