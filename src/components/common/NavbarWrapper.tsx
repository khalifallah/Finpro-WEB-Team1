"use client";

import React from "react";
import { usePathname } from "next/navigation";
import SimpleNavbar from "../SimpleNavbar";

const NavbarWrapper = () => {
  const pathname = usePathname();

  // Daftar rute yang MENGGUNAKAN Simple Navbar
  // (Hanya halaman-halaman ini yang akan menampilkan navbar dari wrapper ini)
  const simpleRoutes = ["/cart", "/checkout", "/orders"];

  // Cek apakah URL saat ini diawali dengan salah satu rute di atas
  const isSimpleRoute = simpleRoutes.some((route) =>
    pathname?.startsWith(route)
  );

  // LOGIKA BARU:
  // 1. Jika ini rute khusus -> Tampilkan SimpleNavbar
  if (isSimpleRoute) {
    return <SimpleNavbar />;
  }

  // 2. Jika BUKAN rute khusus (misal: Homepage) -> Jangan tampilkan apa-apa.
  // Biarkan page.tsx yang mengurus navbarnya sendiri.
  return null;
};

export default NavbarWrapper;
