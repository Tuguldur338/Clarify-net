"use client";

import Link from "next/link";
import Image from "next/image";
import React from "react";

const Header: React.FC = () => {
  return (
    <header className="max-w-screen h-[100px] items-center bg-[#2D6CDF] justify-center flex">
      <div className="flex my-auto bg-[#FFFFFF] max-w-screen w-[97%] h-[80px] items-center justify-between rounded-[12px]">
        <Image
          src="/images/website-logo.png"
          alt="website logo"
          width={500}
          height={500}
          className="w-[150px] h-[100px]"
        />

        <div className="flex my-auto items-center">
          <input
            type="text"
            placeholder="Search"
            className="bg-gray-200 w-[900px] rounded-[30px] px-[5px] h-[45px]"
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
