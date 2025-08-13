import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import * as THREE from 'three';
import { ShoppingBag, Headphones, Laptop, Smartphone } from 'lucide-react';

function isWebGLAvailable() {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch (e) {
    return false;
  }
}

const Hero = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    if (!isWebGLAvailable()) {
      console.warn('WebGL not supported, skipping 3D animation.');
      return;
    }

    const currentMount = mountRef.current;

    // Scene setup
    const scene = new THREE.Scene();

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      currentMount.clientWidth / currentMount.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setClearColor(0x000000, 0);
    currentMount.appendChild(renderer.domElement);

    // Create floating devices helper
    const createDevice = (geometry, position, color) => {
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color(color),
        wireframe: true,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(position.x, position.y, position.z);
      scene.add(mesh);
      return mesh;
    };

    // Create different devices
    const phone = createDevice(
      new THREE.BoxGeometry(0.6, 1.2, 0.1),
      { x: -2, y: 0, z: 0 },
      '#8c5e3b'
    );
    const tablet = createDevice(
      new THREE.BoxGeometry(1.2, 1.6, 0.1),
      { x: 0, y: 0, z: -1 },
      '#5a3921'
    );
    const laptop = createDevice(
      new THREE.BoxGeometry(1.6, 1, 0.1),
      { x: 2, y: 0, z: 0 },
      '#d4a056'
    );
    const headphone = createDevice(
      new THREE.TorusGeometry(0.5, 0.1, 16, 100),
      { x: 0, y: 1.5, z: 0 },
      '#c8a27c'
    );

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Rotate devices
      phone.rotation.y += 0.01;
      phone.rotation.x += 0.005;
      tablet.rotation.y -= 0.008;
      tablet.rotation.z += 0.003;
      laptop.rotation.x += 0.007;
      laptop.rotation.z -= 0.004;
      headphone.rotation.y += 0.015;

      // Float up and down with different phases
      phone.position.y = Math.sin(Date.now() * 0.001) * 0.2;
      tablet.position.y = Math.sin(Date.now() * 0.0015 + 1) * 0.15;
      laptop.position.y = Math.sin(Date.now() * 0.0012 + 2) * 0.25;
      headphone.position.y = 1.5 + Math.sin(Date.now() * 0.002 + 3) * 0.1;

      renderer.render(scene, camera);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && currentMount.contains(renderer.domElement)) {
        currentMount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#f8f5f1] to-white">
      {/* 3D Animation Container */}
      <div
        ref={mountRef}
        className="absolute inset-0 z-0 opacity-40"
        style={{ height: '100%', width: '100%' }}
      ></div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-16 sm:py-24 lg:py-32 flex flex-col lg:flex-row items-center">
        <div className="lg:w-1/2 lg:pr-12 text-center lg:text-left mb-12 lg:mb-0">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#5a3921] leading-tight mb-6">
            Premium Tech <br />
            <span className="text-[#8c5e3b]">Coffee Experience</span>
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-lg mx-auto lg:mx-0">
            Discover the perfect blend of technology and comfort. Browse our
            premium electronic gadgets while enjoying your favorite coffee.
          </p>
          <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
            <Link
              to="/products"
              className="bg-[#8c5e3b] hover:bg-[#5a3921] text-white px-8 py-3 rounded-md font-medium flex items-center"
            >
              <ShoppingBag size={20} className="mr-2" />
              Shop Now
            </Link>
            <Link
              to="/about"
              className="border-2 border-[#8c5e3b] text-[#8c5e3b] hover:bg-[#8c5e3b] hover:text-white px-8 py-3 rounded-md font-medium"
            >
              Learn More
            </Link>
          </div>
        </div>
        <div className="lg:w-1/2 grid grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-lg transform hover:-translate-y-2 transition-transform duration-300">
            <Headphones size={40} className="text-[#8c5e3b] mb-4" />
            <h3 className="text-xl font-semibold text-[#5a3921] mb-2">Audio Devices</h3>
            <p className="text-gray-600">Premium sound quality for the perfect listening experience.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg transform hover:-translate-y-2 transition-transform duration-300 mt-8">
            <Smartphone size={40} className="text-[#8c5e3b] mb-4" />
            <h3 className="text-xl font-semibold text-[#5a3921] mb-2">Smartphones</h3>
            <p className="text-gray-600">Latest smartphones with cutting-edge technology.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg transform hover:-translate-y-2 transition-transform duration-300">
            <Laptop size={40} className="text-[#8c5e3b] mb-4" />
            <h3 className="text-xl font-semibold text-[#5a3921] mb-2">Laptops</h3>
            <p className="text-gray-600">Powerful laptops for work and entertainment.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg transform hover:-translate-y-2 transition-transform duration-300 mt-8">
            <div className="flex items-center justify-center h-10 w-10 rounded-md bg-[#f8f5f1] mb-4">
              <img
                src="/528819492_1144764417483656_3381559210680013388_n.jpg"
                alt="Home Logo"
                className="h-6 w-6 rounded-full"
              />
            </div>
            <h3 className="text-xl font-semibold text-[#5a3921] mb-2">Premium Quality</h3>
            <p className="text-gray-600">Trusted products powered by home.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
