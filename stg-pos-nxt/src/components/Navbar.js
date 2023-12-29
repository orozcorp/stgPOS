"use client";
import Link from "next/link";
import Image from "next/image";
import {
  Navbar,
  NavbarBrand,
  NavbarCollapse,
  NavbarLink,
  NavbarToggle,
} from "flowbite-react";
import { useOnlineStatus } from "@/components/Contexts/OnlineContext";

export default function MainNavbar() {
  const { isOnline } = useOnlineStatus();
  return (
    <Navbar fluid className={`${isOnline ? "bg-zinc-800" : "bg-red-800"}`}>
      <NavbarBrand as={Link} href="/">
        <Image
          src="https://res.cloudinary.com/sterling-generation/image/upload/v1607010626/home/STERLINGWhite.svg"
          className="mr-3 h-6 sm:h-9"
          width={150}
          height={50}
          alt="Sterling POS"
        />
        <span className="self-center whitespace-nowrap text-xl text-white font-semibold ">
          POS {!isOnline && "Offline"}
        </span>
      </NavbarBrand>
      <NavbarToggle />
      <NavbarCollapse>
        <NavbarLink href="/" className="text-white text-xl">
          Inicio
        </NavbarLink>
        <NavbarLink as={Link} href="/" className="text-white text-xl">
          Crear Nota
        </NavbarLink>
        <NavbarLink className="text-white text-xl" href="#">
          Gasto
        </NavbarLink>
        <NavbarLink className="text-white text-xl" href="#">
          Historial de Notas
        </NavbarLink>
      </NavbarCollapse>
    </Navbar>
  );
}
