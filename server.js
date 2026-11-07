// server.ts
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

// src/data/kenyanInstitutions.ts
var ALL_514_KENYAN_INSTITUTIONS = [
  {
    "id": "inst-1",
    "code": "111",
    "name": "University of Nairobi",
    "shortName": "UoN",
    "type": "Public University",
    "county": "Nairobi",
    "town": "Nairobi"
  },
  {
    "id": "inst-2",
    "code": "112",
    "name": "Kenyatta University",
    "shortName": "KU",
    "type": "Public University",
    "county": "Kiambu",
    "town": "Kahawa"
  },
  {
    "id": "inst-3",
    "code": "113",
    "name": "Jomo Kenyatta University of Agriculture and Technology",
    "shortName": "JKUAT",
    "type": "Public University",
    "county": "Kiambu",
    "town": "Juja"
  },
  {
    "id": "inst-4",
    "code": "114",
    "name": "Moi University",
    "shortName": "Moi",
    "type": "Public University",
    "county": "Uasin Gishu",
    "town": "Eldoret"
  },
  {
    "id": "inst-5",
    "code": "115",
    "name": "Egerton University",
    "shortName": "Egerton",
    "type": "Public University",
    "county": "Nakuru",
    "town": "Njoro"
  },
  {
    "id": "inst-6",
    "code": "116",
    "name": "Technical University of Kenya",
    "shortName": "TUK",
    "type": "Public University",
    "county": "Nairobi",
    "town": "Nairobi"
  },
  {
    "id": "inst-7",
    "code": "117",
    "name": "Maseno University",
    "shortName": "Maseno",
    "type": "Public University",
    "county": "Kisumu",
    "town": "Maseno"
  },
  {
    "id": "inst-8",
    "code": "119",
    "name": "Multimedia University of Kenya",
    "shortName": "MMU",
    "type": "Public University",
    "county": "Nairobi",
    "town": "Rongai"
  },
  {
    "id": "inst-9",
    "code": "120",
    "name": "Dedan Kimathi University of Technology",
    "shortName": "DeKUT",
    "type": "Public University",
    "county": "Nyeri",
    "town": "Nyeri"
  },
  {
    "id": "inst-10",
    "code": "121",
    "name": "Masinde Muliro University of Science and Technology",
    "shortName": "MMUST",
    "type": "Public University",
    "county": "Kakamega",
    "town": "Kakamega"
  },
  {
    "id": "inst-11",
    "code": "122",
    "name": "Chuka University",
    "shortName": "Chuka",
    "type": "Public University",
    "county": "Tharaka Nithi",
    "town": "Chuka"
  },
  {
    "id": "inst-12",
    "code": "123",
    "name": "Machakos University",
    "shortName": "Machakos",
    "type": "Public University",
    "county": "Machakos",
    "town": "Machakos"
  },
  {
    "id": "inst-13",
    "code": "124",
    "name": "Kisii University",
    "shortName": "Kisii",
    "type": "Public University",
    "county": "Kisii",
    "town": "Kisii"
  },
  {
    "id": "inst-14",
    "code": "125",
    "name": "Technical University of Mombasa",
    "shortName": "TUM",
    "type": "Public University",
    "county": "Mombasa",
    "town": "Mombasa"
  },
  {
    "id": "inst-15",
    "code": "126",
    "name": "Meru University of Science and Technology",
    "shortName": "MUST",
    "type": "Public University",
    "county": "Meru",
    "town": "Meru"
  },
  {
    "id": "inst-16",
    "code": "130",
    "name": "South Eastern Kenya University",
    "shortName": "SEKU",
    "type": "Public University",
    "county": "Kitui",
    "town": "Kitui"
  },
  {
    "id": "inst-17",
    "code": "131",
    "name": "University of Eldoret",
    "shortName": "UoE",
    "type": "Public University",
    "county": "Uasin Gishu",
    "town": "Eldoret"
  },
  {
    "id": "inst-18",
    "code": "132",
    "name": "Pwani University",
    "shortName": "Pwani",
    "type": "Public University",
    "county": "Kilifi",
    "town": "Kilifi"
  },
  {
    "id": "inst-19",
    "code": "133",
    "name": "Karatina University",
    "shortName": "Karatina",
    "type": "Public University",
    "county": "Nyeri",
    "town": "Karatina"
  },
  {
    "id": "inst-20",
    "code": "134",
    "name": "University of Kabianga",
    "shortName": "Kabianga",
    "type": "Public University",
    "county": "Kericho",
    "town": "Kericho"
  },
  {
    "id": "inst-21",
    "code": "135",
    "name": "Murang'a University of Technology",
    "shortName": "MUT",
    "type": "Public University",
    "county": "Murang'a",
    "town": "Murang'a"
  },
  {
    "id": "inst-22",
    "code": "136",
    "name": "Kibabii University",
    "shortName": "Kibabii",
    "type": "Public University",
    "county": "Bungoma",
    "town": "Bungoma"
  },
  {
    "id": "inst-23",
    "code": "137",
    "name": "Rongo University",
    "shortName": "Rongo",
    "type": "Public University",
    "county": "Migori",
    "town": "Rongo"
  },
  {
    "id": "inst-24",
    "code": "138",
    "name": "Taita Taveta University",
    "shortName": "TTU",
    "type": "Public University",
    "county": "Taita Taveta",
    "town": "Voi"
  },
  {
    "id": "inst-25",
    "code": "139",
    "name": "The Co-operative University of Kenya",
    "shortName": "CUK",
    "type": "Public University",
    "county": "Nairobi",
    "town": "Karen"
  },
  {
    "id": "inst-26",
    "code": "144",
    "name": "Garissa University",
    "shortName": "Garissa Univ",
    "type": "Public University",
    "county": "Garissa",
    "town": "Garissa"
  },
  {
    "id": "inst-27",
    "code": "145",
    "name": "Alupe University",
    "shortName": "Alupe",
    "type": "Public University",
    "county": "Busia",
    "town": "Busia"
  },
  {
    "id": "inst-28",
    "code": "146",
    "name": "Kaimosi Friends University",
    "shortName": "KAFU",
    "type": "Public University",
    "county": "Vihiga",
    "town": "Kaimosi"
  },
  {
    "id": "inst-29",
    "code": "147",
    "name": "Tharaka University",
    "shortName": "Tharaka Univ",
    "type": "Public University",
    "county": "Tharaka Nithi",
    "town": "Tharaka"
  },
  {
    "id": "inst-30",
    "code": "148",
    "name": "Tom Mboya University",
    "shortName": "TMU",
    "type": "Public University",
    "county": "Homa Bay",
    "town": "Homa Bay"
  },
  {
    "id": "inst-31",
    "code": "149",
    "name": "University of Embu",
    "shortName": "UoEm",
    "type": "Public University",
    "county": "Embu",
    "town": "Embu"
  },
  {
    "id": "inst-32",
    "code": "150",
    "name": "Kirinyaga University",
    "shortName": "KyU",
    "type": "Public University",
    "county": "Kirinyaga",
    "town": "Kutus"
  },
  {
    "id": "inst-33",
    "code": "151",
    "name": "Laikipia University",
    "shortName": "LU",
    "type": "Public University",
    "county": "Laikipia",
    "town": "Nyahururu"
  },
  {
    "id": "inst-34",
    "code": "152",
    "name": "Bomet University College",
    "shortName": "BUC",
    "type": "Public University",
    "county": "Bomet",
    "town": "Bomet"
  },
  {
    "id": "inst-35",
    "code": "153",
    "name": "Turkana University College",
    "shortName": "TUC",
    "type": "Public University",
    "county": "Turkana",
    "town": "Lodwar"
  },
  {
    "id": "inst-36",
    "code": "154",
    "name": "Koitalel Samoei University College",
    "shortName": "KSUC",
    "type": "Public University",
    "county": "Nandi",
    "town": "Nandi Hills"
  },
  {
    "id": "inst-37",
    "code": "155",
    "name": "Mama Ngina University College",
    "shortName": "MNUC",
    "type": "Public University",
    "county": "Kiambu",
    "town": "Gatundu"
  },
  {
    "id": "inst-38",
    "code": "156",
    "name": "Open University of Kenya",
    "shortName": "OUK",
    "type": "Public University",
    "county": "Machakos",
    "town": "Konza"
  },
  {
    "id": "inst-39",
    "code": "157",
    "name": "National Defence University - Kenya",
    "shortName": "NDU-K",
    "type": "Public University",
    "county": "Nakuru",
    "town": "Lanet"
  },
  {
    "id": "inst-40",
    "code": "158",
    "name": "Kenya Utalii University College",
    "shortName": "Utalii College",
    "type": "Public University",
    "county": "Nairobi",
    "town": "Ruaraka"
  },
  {
    "id": "inst-41",
    "code": "159",
    "name": "Kenya Coast University College",
    "shortName": "KCUC",
    "type": "Public University",
    "county": "Kilifi",
    "town": "Kilifi"
  },
  {
    "id": "inst-42",
    "code": "160",
    "name": "Odera Akang'o University College",
    "shortName": "OAUC",
    "type": "Public University",
    "county": "Siaya",
    "town": "Yala"
  },
  {
    "id": "inst-43",
    "code": "118",
    "name": "Strathmore University",
    "shortName": "Strathmore",
    "type": "Private University",
    "county": "Nairobi",
    "town": "Madaraka"
  },
  {
    "id": "inst-44",
    "code": "127",
    "name": "Daystar University",
    "shortName": "Daystar",
    "type": "Private University",
    "county": "Machakos",
    "town": "Athi River"
  },
  {
    "id": "inst-45",
    "code": "128",
    "name": "United States International University Africa",
    "shortName": "USIU-A",
    "type": "Private University",
    "county": "Nairobi",
    "town": "Roysambu"
  },
  {
    "id": "inst-46",
    "code": "140",
    "name": "Mount Kenya University",
    "shortName": "MKU",
    "type": "Private University",
    "county": "Kiambu",
    "town": "Thika"
  },
  {
    "id": "inst-47",
    "code": "141",
    "name": "Kabarak University",
    "shortName": "Kabarak",
    "type": "Private University",
    "county": "Nakuru",
    "town": "Nakuru"
  },
  {
    "id": "inst-48",
    "code": "142",
    "name": "Catholic University of Eastern Africa",
    "shortName": "CUEA",
    "type": "Private University",
    "county": "Nairobi",
    "town": "Karen"
  },
  {
    "id": "inst-49",
    "code": "143",
    "name": "KCA University",
    "shortName": "KCA",
    "type": "Private University",
    "county": "Nairobi",
    "town": "Ruaraka"
  },
  {
    "id": "inst-50",
    "code": "161",
    "name": "University of Eastern Africa, Baraton",
    "shortName": "UEAB",
    "type": "Private University",
    "county": "Nandi",
    "town": "Baraton"
  },
  {
    "id": "inst-51",
    "code": "162",
    "name": "Africa Nazarene University",
    "shortName": "ANU",
    "type": "Private University",
    "county": "Kajiado",
    "town": "Ongata Rongai"
  },
  {
    "id": "inst-52",
    "code": "163",
    "name": "Scott Christian University",
    "shortName": "Scott",
    "type": "Private University",
    "county": "Machakos",
    "town": "Machakos"
  },
  {
    "id": "inst-53",
    "code": "164",
    "name": "St. Paul's University",
    "shortName": "SPU",
    "type": "Private University",
    "county": "Kiambu",
    "town": "Limuru"
  },
  {
    "id": "inst-54",
    "code": "165",
    "name": "Pan Africa Christian University",
    "shortName": "PAC",
    "type": "Private University",
    "county": "Nairobi",
    "town": "Roysambu"
  },
  {
    "id": "inst-55",
    "code": "166",
    "name": "Riara University",
    "shortName": "Riara",
    "type": "Private University",
    "county": "Nairobi",
    "town": "Madaraka"
  },
  {
    "id": "inst-56",
    "code": "167",
    "name": "Pioneer International University",
    "shortName": "PIU",
    "type": "Private University",
    "county": "Nairobi",
    "town": "Murang'a Rd"
  },
  {
    "id": "inst-57",
    "code": "168",
    "name": "KAG EAST University",
    "shortName": "KAG",
    "type": "Private University",
    "county": "Kiambu",
    "town": "Buruburu"
  },
  {
    "id": "inst-58",
    "code": "169",
    "name": "Zetech University",
    "shortName": "Zetech",
    "type": "Private University",
    "county": "Kiambu",
    "town": "Ruiru"
  },
  {
    "id": "inst-59",
    "code": "170",
    "name": "Management University of Africa",
    "shortName": "MUA",
    "type": "Private University",
    "county": "Machakos",
    "town": "Kisaju"
  },
  {
    "id": "inst-60",
    "code": "171",
    "name": "Kiriri Women's University of Science and Technology",
    "shortName": "KWUST",
    "type": "Private University",
    "county": "Nairobi",
    "town": "Kasarani"
  },
  {
    "id": "inst-61",
    "code": "172",
    "name": "Lukenya University",
    "shortName": "Lukenya",
    "type": "Private University",
    "county": "Makueni",
    "town": "Mtito Andei"
  },
  {
    "id": "inst-62",
    "code": "173",
    "name": "Tangaza University",
    "shortName": "Tangaza",
    "type": "Private University",
    "county": "Nairobi",
    "town": "Karen"
  },
  {
    "id": "inst-63",
    "code": "174",
    "name": "RAF International University",
    "shortName": "RIU",
    "type": "Private University",
    "county": "Kajiado",
    "town": "Bissel"
  },
  {
    "id": "inst-64",
    "code": "175",
    "name": "Marist International University College",
    "shortName": "MIUC",
    "type": "Private University",
    "county": "Nairobi",
    "town": "Karen"
  },
  {
    "id": "inst-65",
    "code": "176",
    "name": "AMREF International University",
    "shortName": "AMIU",
    "type": "Private University",
    "county": "Nairobi",
    "town": "Lang'ata"
  },
  {
    "id": "inst-66",
    "code": "177",
    "name": "Umma University",
    "shortName": "Umma",
    "type": "Private University",
    "county": "Kajiado",
    "town": "Kajiado"
  },
  {
    "id": "inst-67",
    "code": "178",
    "name": "Great Lakes University of Kisumu",
    "shortName": "GLUK",
    "type": "Private University",
    "county": "Kisumu",
    "town": "Kibos"
  },
  {
    "id": "inst-68",
    "code": "179",
    "name": "Gretsa University",
    "shortName": "Gretsa",
    "type": "Private University",
    "county": "Kiambu",
    "town": "Thika"
  },
  {
    "id": "inst-69",
    "code": "180",
    "name": "International Leadership University",
    "shortName": "ILU",
    "type": "Private University",
    "county": "Nairobi",
    "town": "Kilimani"
  },
  {
    "id": "inst-70",
    "code": "181",
    "name": "Kenya Highlands Evangelical University",
    "shortName": "KHEU",
    "type": "Private University",
    "county": "Kericho",
    "town": "Kericho"
  },
  {
    "id": "inst-71",
    "code": "182",
    "name": "Presbyterian University of East Africa",
    "shortName": "PUEA",
    "type": "Private University",
    "county": "Kiambu",
    "town": "Kikuyu"
  },
  {
    "id": "inst-72",
    "code": "183",
    "name": "Adventist University of Africa",
    "shortName": "AUA",
    "type": "Private University",
    "county": "Kajiado",
    "town": "Rongai"
  },
  {
    "id": "inst-73",
    "code": "184",
    "name": "Hekima University College",
    "shortName": "Hekima",
    "type": "Private University",
    "county": "Nairobi",
    "town": "Ngong Rd"
  },
  {
    "id": "inst-74",
    "code": "185",
    "name": "Aga Khan University - Kenya",
    "shortName": "AKU",
    "type": "Private University",
    "county": "Nairobi",
    "town": "Parklands"
  },
  {
    "id": "inst-75",
    "code": "186",
    "name": "Uzima University",
    "shortName": "Uzima",
    "type": "Private University",
    "county": "Kisumu",
    "town": "Kisumu"
  },
  {
    "id": "inst-76",
    "code": "187",
    "name": "Regina Pacis University College",
    "shortName": "RPUC",
    "type": "Private University",
    "county": "Nairobi",
    "town": "Ruaraka"
  },
  {
    "id": "inst-77",
    "code": "188",
    "name": "Al-Qalam University College",
    "shortName": "Al-Qalam",
    "type": "Private University",
    "county": "Garissa",
    "town": "Garissa"
  },
  {
    "id": "inst-78",
    "code": "189",
    "name": "East Africa University",
    "shortName": "EAU",
    "type": "Private University",
    "county": "Kajiado",
    "town": "Kitengela"
  },
  {
    "id": "inst-79",
    "code": "190",
    "name": "Nairobi International University",
    "shortName": "NIU",
    "type": "Private University",
    "county": "Nairobi",
    "town": "Kasarani"
  },
  {
    "id": "inst-80",
    "code": "191",
    "name": "St. Joseph University College",
    "shortName": "SJUC",
    "type": "Private University",
    "county": "Migori",
    "town": "Migori"
  },
  {
    "id": "inst-81",
    "code": "201",
    "name": "Kabete National Polytechnic",
    "shortName": "Kabete NP",
    "type": "National Polytechnic",
    "county": "Nairobi",
    "town": "Kabete"
  },
  {
    "id": "inst-82",
    "code": "202",
    "name": "Nairobi Technical Training Institute",
    "shortName": "NTTI",
    "type": "National Polytechnic",
    "county": "Nairobi",
    "town": "Ngara"
  },
  {
    "id": "inst-83",
    "code": "203",
    "name": "Kisumu National Polytechnic",
    "shortName": "Kisumu NP",
    "type": "National Polytechnic",
    "county": "Kisumu",
    "town": "Kisumu"
  },
  {
    "id": "inst-84",
    "code": "204",
    "name": "Kenya Coast National Polytechnic",
    "shortName": "Kenya Coast NP",
    "type": "National Polytechnic",
    "county": "Mombasa",
    "town": "Mombasa"
  },
  {
    "id": "inst-85",
    "code": "205",
    "name": "Rift Valley National Polytechnic",
    "shortName": "RVNP",
    "type": "National Polytechnic",
    "county": "Nakuru",
    "town": "Nakuru"
  },
  {
    "id": "inst-86",
    "code": "206",
    "name": "Eldoret National Polytechnic",
    "shortName": "Eldoret NP",
    "type": "National Polytechnic",
    "county": "Uasin Gishu",
    "town": "Eldoret"
  },
  {
    "id": "inst-87",
    "code": "207",
    "name": "Nyeri National Polytechnic",
    "shortName": "Nyeri NP",
    "type": "National Polytechnic",
    "county": "Nyeri",
    "town": "Nyeri"
  },
  {
    "id": "inst-88",
    "code": "208",
    "name": "Sigalagala National Polytechnic",
    "shortName": "Sigalagala NP",
    "type": "National Polytechnic",
    "county": "Kakamega",
    "town": "Kakamega"
  },
  {
    "id": "inst-89",
    "code": "212",
    "name": "Kitale National Polytechnic",
    "shortName": "Kitale NP",
    "type": "National Polytechnic",
    "county": "Trans Nzoia",
    "town": "Kitale"
  },
  {
    "id": "inst-90",
    "code": "213",
    "name": "Meru National Polytechnic",
    "shortName": "Meru NP",
    "type": "National Polytechnic",
    "county": "Meru",
    "town": "Meru"
  },
  {
    "id": "inst-91",
    "code": "214",
    "name": "North Eastern National Polytechnic",
    "shortName": "North Eastern NP",
    "type": "National Polytechnic",
    "county": "Garissa",
    "town": "Garissa"
  },
  {
    "id": "inst-92",
    "code": "215",
    "name": "Kisii National Polytechnic",
    "shortName": "Kisii NP",
    "type": "National Polytechnic",
    "county": "Kisii",
    "town": "Kisii"
  },
  {
    "id": "inst-93",
    "code": "216",
    "name": "Machakos National Polytechnic",
    "shortName": "Machakos NP",
    "type": "National Polytechnic",
    "county": "Machakos",
    "town": "Machakos"
  },
  {
    "id": "inst-94",
    "code": "217",
    "name": "Kiambu National Polytechnic",
    "shortName": "Kiambu NP",
    "type": "National Polytechnic",
    "county": "Kiambu",
    "town": "Kiambu"
  },
  {
    "id": "inst-95",
    "code": "218",
    "name": "Bungoma National Polytechnic",
    "shortName": "Bungoma NP",
    "type": "National Polytechnic",
    "county": "Bungoma",
    "town": "Bungoma"
  },
  {
    "id": "inst-96",
    "code": "219",
    "name": "Friends College Kaimosi National Polytechnic",
    "shortName": "FCKNP",
    "type": "National Polytechnic",
    "county": "Vihiga",
    "town": "Kaimosi"
  },
  {
    "id": "inst-97",
    "code": "220",
    "name": "Masai National Polytechnic",
    "shortName": "Masai NP",
    "type": "National Polytechnic",
    "county": "Kajiado",
    "town": "Kajiado"
  },
  {
    "id": "inst-98",
    "code": "221",
    "name": "Coast National Polytechnic",
    "shortName": "Coast NP",
    "type": "National Polytechnic",
    "county": "Kilifi",
    "town": "Kilifi"
  },
  {
    "id": "inst-99",
    "code": "222",
    "name": "Baringo National Polytechnic",
    "shortName": "Baringo NP",
    "type": "National Polytechnic",
    "county": "Baringo",
    "town": "Kabarnet"
  },
  {
    "id": "inst-100",
    "code": "223",
    "name": "Mathenge National Polytechnic",
    "shortName": "Mathenge NP",
    "type": "National Polytechnic",
    "county": "Nyeri",
    "town": "Othaya"
  },
  {
    "id": "inst-101",
    "code": "224",
    "name": "Michuki National Polytechnic",
    "shortName": "Michuki NP",
    "type": "National Polytechnic",
    "county": "Murang'a",
    "town": "Kangema"
  },
  {
    "id": "inst-102",
    "code": "225",
    "name": "Siaya National Polytechnic",
    "shortName": "Siaya NP",
    "type": "National Polytechnic",
    "county": "Siaya",
    "town": "Siaya"
  },
  {
    "id": "inst-103",
    "code": "226",
    "name": "Kericho National Polytechnic",
    "shortName": "Kericho NP",
    "type": "National Polytechnic",
    "county": "Kericho",
    "town": "Kericho"
  },
  {
    "id": "inst-104",
    "code": "227",
    "name": "Shanzu National Polytechnic",
    "shortName": "Shanzu NP",
    "type": "National Polytechnic",
    "county": "Mombasa",
    "town": "Shanzu"
  },
  {
    "id": "inst-105",
    "code": "228",
    "name": "Mandera National Polytechnic",
    "shortName": "Mandera NP",
    "type": "National Polytechnic",
    "county": "Mandera",
    "town": "Mandera"
  },
  {
    "id": "inst-106",
    "code": "229",
    "name": "Wajir National Polytechnic",
    "shortName": "Wajir NP",
    "type": "National Polytechnic",
    "county": "Wajir",
    "town": "Wajir"
  },
  {
    "id": "inst-107",
    "code": "230",
    "name": "Turkana National Polytechnic",
    "shortName": "Turkana NP",
    "type": "National Polytechnic",
    "county": "Turkana",
    "town": "Lodwar"
  },
  {
    "id": "inst-108",
    "code": "231",
    "name": "Mawego National Polytechnic",
    "shortName": "Mawego NP",
    "type": "National Polytechnic",
    "county": "Homa Bay",
    "town": "Oyugis"
  },
  {
    "id": "inst-109",
    "code": "232",
    "name": "Bomet National Polytechnic",
    "shortName": "Bomet NP",
    "type": "National Polytechnic",
    "county": "Bomet",
    "town": "Bomet"
  },
  {
    "id": "inst-110",
    "code": "233",
    "name": "Nyandarua National Polytechnic",
    "shortName": "Nyandarua NP",
    "type": "National Polytechnic",
    "county": "Nyandarua",
    "town": "Ol Kalou"
  },
  {
    "id": "inst-111",
    "code": "234",
    "name": "Embu National Polytechnic",
    "shortName": "Embu NP",
    "type": "National Polytechnic",
    "county": "Embu",
    "town": "Embu"
  },
  {
    "id": "inst-112",
    "code": "235",
    "name": "Tharaka Nithi National Polytechnic",
    "shortName": "Tharaka NP",
    "type": "National Polytechnic",
    "county": "Tharaka Nithi",
    "town": "Chuka"
  },
  {
    "id": "inst-113",
    "code": "236",
    "name": "Kitui National Polytechnic",
    "shortName": "Kitui NP",
    "type": "National Polytechnic",
    "county": "Kitui",
    "town": "Kitui"
  },
  {
    "id": "inst-114",
    "code": "301",
    "name": "Kagumo Teachers Training College",
    "shortName": "Kagumo TTC",
    "type": "Teacher Training College",
    "county": "Nyeri",
    "town": "Gatitu"
  },
  {
    "id": "inst-115",
    "code": "302",
    "name": "Machakos Teachers Training College",
    "shortName": "Machakos TTC",
    "type": "Teacher Training College",
    "county": "Machakos",
    "town": "Machakos"
  },
  {
    "id": "inst-116",
    "code": "303",
    "name": "Asumbi Teachers Training College",
    "shortName": "Asumbi TTC",
    "type": "Teacher Training College",
    "county": "Homa Bay",
    "town": "Asumbi"
  },
  {
    "id": "inst-117",
    "code": "304",
    "name": "Kamwenja Teachers Training College",
    "shortName": "Kamwenja TTC",
    "type": "Teacher Training College",
    "county": "Nyeri",
    "town": "Nyeri"
  },
  {
    "id": "inst-118",
    "code": "305",
    "name": "Eregi Teachers Training College",
    "shortName": "Eregi TTC",
    "type": "Teacher Training College",
    "county": "Kakamega",
    "town": "Eregi"
  },
  {
    "id": "inst-119",
    "code": "306",
    "name": "Shanzu Teachers Training College",
    "shortName": "Shanzu TTC",
    "type": "Teacher Training College",
    "county": "Mombasa",
    "town": "Shanzu"
  },
  {
    "id": "inst-120",
    "code": "307",
    "name": "Thogoto Teachers Training College",
    "shortName": "Thogoto TTC",
    "type": "Teacher Training College",
    "county": "Kiambu",
    "town": "Kikuyu"
  },
  {
    "id": "inst-121",
    "code": "308",
    "name": "Kaimosi Teachers Training College",
    "shortName": "Kaimosi TTC",
    "type": "Teacher Training College",
    "county": "Vihiga",
    "town": "Kaimosi"
  },
  {
    "id": "inst-122",
    "code": "309",
    "name": "Tambach Teachers Training College",
    "shortName": "Tambach TTC",
    "type": "Teacher Training College",
    "county": "Elgeyo Marakwet",
    "town": "Tambach"
  },
  {
    "id": "inst-123",
    "code": "310",
    "name": "Mosoriot Teachers Training College",
    "shortName": "Mosoriot TTC",
    "type": "Teacher Training College",
    "county": "Nandi",
    "town": "Mosoriot"
  },
  {
    "id": "inst-124",
    "code": "311",
    "name": "Bondo Teachers Training College",
    "shortName": "Bondo TTC",
    "type": "Teacher Training College",
    "county": "Siaya",
    "town": "Bondo"
  },
  {
    "id": "inst-125",
    "code": "312",
    "name": "Garissa Teachers Training College",
    "shortName": "Garissa TTC",
    "type": "Teacher Training College",
    "county": "Garissa",
    "town": "Garissa"
  },
  {
    "id": "inst-126",
    "code": "313",
    "name": "Meru Teachers Training College",
    "shortName": "Meru TTC",
    "type": "Teacher Training College",
    "county": "Meru",
    "town": "Meru"
  },
  {
    "id": "inst-127",
    "code": "314",
    "name": "Egoji Teachers Training College",
    "shortName": "Egoji TTC",
    "type": "Teacher Training College",
    "county": "Meru",
    "town": "Egoji"
  },
  {
    "id": "inst-128",
    "code": "315",
    "name": "Migori Teachers Training College",
    "shortName": "Migori TTC",
    "type": "Teacher Training College",
    "county": "Migori",
    "town": "Migori"
  },
  {
    "id": "inst-129",
    "code": "316",
    "name": "Murang'a Teachers Training College",
    "shortName": "Murang'a TTC",
    "type": "Teacher Training College",
    "county": "Murang'a",
    "town": "Makuyu"
  },
  {
    "id": "inst-130",
    "code": "317",
    "name": "Kenyenya Teachers Training College",
    "shortName": "Kenyenya TTC",
    "type": "Teacher Training College",
    "county": "Kisii",
    "town": "Kenyenya"
  },
  {
    "id": "inst-131",
    "code": "318",
    "name": "Kericho Teachers Training College",
    "shortName": "Kericho TTC",
    "type": "Teacher Training College",
    "county": "Kericho",
    "town": "Kericho"
  },
  {
    "id": "inst-132",
    "code": "319",
    "name": "Lugari Teachers Training College",
    "shortName": "Lugari TTC",
    "type": "Teacher Training College",
    "county": "Kakamega",
    "town": "Lugari"
  },
  {
    "id": "inst-133",
    "code": "320",
    "name": "Aberdare Teachers Training College",
    "shortName": "Aberdare TTC",
    "type": "Teacher Training College",
    "county": "Nyandarua",
    "town": "Ndaragwa"
  },
  {
    "id": "inst-134",
    "code": "321",
    "name": "Narok Teachers Training College",
    "shortName": "Narok TTC",
    "type": "Teacher Training College",
    "county": "Narok",
    "town": "Narok"
  },
  {
    "id": "inst-135",
    "code": "322",
    "name": "Kitui Teachers Training College",
    "shortName": "Kitui TTC",
    "type": "Teacher Training College",
    "county": "Kitui",
    "town": "Kitui"
  },
  {
    "id": "inst-136",
    "code": "323",
    "name": "St. John's Teachers Training College Kilifi",
    "shortName": "St. John's TTC",
    "type": "Teacher Training College",
    "county": "Kilifi",
    "town": "Kilifi"
  },
  {
    "id": "inst-137",
    "code": "324",
    "name": "Baringo Teachers Training College",
    "shortName": "Baringo TTC",
    "type": "Teacher Training College",
    "county": "Baringo",
    "town": "Seretunin"
  },
  {
    "id": "inst-138",
    "code": "325",
    "name": "Samburu Teachers Training College",
    "shortName": "Samburu TTC",
    "type": "Teacher Training College",
    "county": "Samburu",
    "town": "Maralal"
  },
  {
    "id": "inst-139",
    "code": "326",
    "name": "Turkana Teachers Training College",
    "shortName": "Turkana TTC",
    "type": "Teacher Training College",
    "county": "Turkana",
    "town": "Lodwar"
  },
  {
    "id": "inst-140",
    "code": "327",
    "name": "Mandera Teachers Training College",
    "shortName": "Mandera TTC",
    "type": "Teacher Training College",
    "county": "Mandera",
    "town": "Mandera"
  },
  {
    "id": "inst-141",
    "code": "328",
    "name": "Moyale Teachers Training College",
    "shortName": "Moyale TTC",
    "type": "Teacher Training College",
    "county": "Marsabit",
    "town": "Moyale"
  },
  {
    "id": "inst-142",
    "code": "329",
    "name": "Kibabii Diploma Teachers Training College",
    "shortName": "Kibabii Diploma TTC",
    "type": "Teacher Training College",
    "county": "Bungoma",
    "town": "Kibabii"
  },
  {
    "id": "inst-143",
    "code": "330",
    "name": "Lugari Diploma Teachers Training College",
    "shortName": "Lugari Diploma TTC",
    "type": "Teacher Training College",
    "county": "Kakamega",
    "town": "Lugari"
  },
  {
    "id": "inst-144",
    "code": "331",
    "name": "Rongo Teachers Training College",
    "shortName": "Rongo TTC",
    "type": "Teacher Training College",
    "county": "Migori",
    "town": "Rongo"
  },
  {
    "id": "inst-145",
    "code": "332",
    "name": "Ugenya Teachers Training College",
    "shortName": "Ugenya TTC",
    "type": "Teacher Training College",
    "county": "Siaya",
    "town": "Ugenya"
  },
  {
    "id": "inst-146",
    "code": "333",
    "name": "Kajiado Teachers Training College",
    "shortName": "Kajiado TTC",
    "type": "Teacher Training College",
    "county": "Kajiado",
    "town": "Kajiado"
  },
  {
    "id": "inst-147",
    "code": "334",
    "name": "Kwale Teachers Training College",
    "shortName": "Kwale TTC",
    "type": "Teacher Training College",
    "county": "Kwale",
    "town": "Kwale"
  },
  {
    "id": "inst-148",
    "code": "335",
    "name": "Taita Taveta Teachers Training College",
    "shortName": "Taita Taveta TTC",
    "type": "Teacher Training College",
    "county": "Taita Taveta",
    "town": "Wundanyi"
  },
  {
    "id": "inst-149",
    "code": "351",
    "name": "Kenya Medical Training College - Nairobi Campus",
    "shortName": "KMTC Nairobi",
    "type": "Medical College",
    "county": "Nairobi",
    "town": "Kenyatta"
  },
  {
    "id": "inst-150",
    "code": "352",
    "name": "Kenya Medical Training College - Mombasa Campus",
    "shortName": "KMTC Mombasa",
    "type": "Medical College",
    "county": "Mombasa",
    "town": "Mombasa"
  },
  {
    "id": "inst-151",
    "code": "353",
    "name": "Kenya Medical Training College - Kisumu Campus",
    "shortName": "KMTC Kisumu",
    "type": "Medical College",
    "county": "Kisumu",
    "town": "Kisumu"
  },
  {
    "id": "inst-152",
    "code": "354",
    "name": "Kenya Medical Training College - Nakuru Campus",
    "shortName": "KMTC Nakuru",
    "type": "Medical College",
    "county": "Nakuru",
    "town": "Nakuru"
  },
  {
    "id": "inst-153",
    "code": "355",
    "name": "Kenya Medical Training College - Eldoret Campus",
    "shortName": "KMTC Eldoret",
    "type": "Medical College",
    "county": "Uasin Gishu",
    "town": "Eldoret"
  },
  {
    "id": "inst-154",
    "code": "356",
    "name": "Kenya Medical Training College - Nyeri Campus",
    "shortName": "KMTC Nyeri",
    "type": "Medical College",
    "county": "Nyeri",
    "town": "Nyeri"
  },
  {
    "id": "inst-155",
    "code": "357",
    "name": "Kenya Medical Training College - Machakos Campus",
    "shortName": "KMTC Machakos",
    "type": "Medical College",
    "county": "Machakos",
    "town": "Machakos"
  },
  {
    "id": "inst-156",
    "code": "358",
    "name": "Kenya Medical Training College - Kakamega Campus",
    "shortName": "KMTC Kakamega",
    "type": "Medical College",
    "county": "Kakamega",
    "town": "Kakamega"
  },
  {
    "id": "inst-157",
    "code": "359",
    "name": "Kenya Medical Training College - Kilifi Campus",
    "shortName": "KMTC Kilifi",
    "type": "Medical College",
    "county": "Kilifi",
    "town": "Kilifi"
  },
  {
    "id": "inst-158",
    "code": "360",
    "name": "Kenya Medical Training College - Garissa Campus",
    "shortName": "KMTC Garissa",
    "type": "Medical College",
    "county": "Garissa",
    "town": "Garissa"
  },
  {
    "id": "inst-159",
    "code": "361",
    "name": "Kenya Medical Training College - Embu Campus",
    "shortName": "KMTC Embu",
    "type": "Medical College",
    "county": "Embu",
    "town": "Embu"
  },
  {
    "id": "inst-160",
    "code": "362",
    "name": "Kenya Medical Training College - Meru Campus",
    "shortName": "KMTC Meru",
    "type": "Medical College",
    "county": "Meru",
    "town": "Meru"
  },
  {
    "id": "inst-161",
    "code": "209",
    "name": "Railway Training Institute",
    "shortName": "RTI",
    "type": "Technical College",
    "county": "Nairobi",
    "town": "South B"
  },
  {
    "id": "inst-162",
    "code": "210",
    "name": "Kenya Institute of Mass Communication",
    "shortName": "KIMC",
    "type": "Technical College",
    "county": "Nairobi",
    "town": "South B"
  },
  {
    "id": "inst-163",
    "code": "211",
    "name": "Kenya Utalii College",
    "shortName": "Utalii",
    "type": "Technical College",
    "county": "Nairobi",
    "town": "Ruaraka"
  },
  {
    "id": "inst-164",
    "code": "363",
    "name": "Kenya Water Institute",
    "shortName": "KEWI",
    "type": "Technical College",
    "county": "Nairobi",
    "town": "South C"
  },
  {
    "id": "inst-165",
    "code": "401",
    "name": "Dagoretti Technical and Vocational College",
    "shortName": "Dagoretti TVC",
    "type": "Technical College",
    "county": "Nairobi",
    "town": "Dagoretti"
  },
  {
    "id": "inst-166",
    "code": "402",
    "name": "Kasarani Technical and Vocational College",
    "shortName": "Kasarani TVC",
    "type": "Technical College",
    "county": "Nairobi",
    "town": "Kasarani"
  },
  {
    "id": "inst-167",
    "code": "403",
    "name": "Embakasi Technical and Vocational College",
    "shortName": "Embakasi TVC",
    "type": "Technical College",
    "county": "Nairobi",
    "town": "Embakasi"
  },
  {
    "id": "inst-168",
    "code": "404",
    "name": "Kibra Technical and Vocational College",
    "shortName": "Kibra TVC",
    "type": "Technical College",
    "county": "Nairobi",
    "town": "Kibra"
  },
  {
    "id": "inst-169",
    "code": "405",
    "name": "Westlands Technical and Vocational College",
    "shortName": "Westlands TVC",
    "type": "Technical College",
    "county": "Nairobi",
    "town": "Westlands"
  },
  {
    "id": "inst-170",
    "code": "406",
    "name": "Starehe Technical and Vocational College",
    "shortName": "Starehe TVC",
    "type": "Technical College",
    "county": "Nairobi",
    "town": "Starehe"
  },
  {
    "id": "inst-171",
    "code": "407",
    "name": "Kamukunji Technical and Vocational College",
    "shortName": "Kamukunji TVC",
    "type": "Technical College",
    "county": "Nairobi",
    "town": "Kamukunji"
  },
  {
    "id": "inst-172",
    "code": "408",
    "name": "Langata Technical and Vocational College",
    "shortName": "Langata TVC",
    "type": "Technical College",
    "county": "Nairobi",
    "town": "Langata"
  },
  {
    "id": "inst-173",
    "code": "409",
    "name": "Ruaraka Technical and Vocational College",
    "shortName": "Ruaraka TVC",
    "type": "Technical College",
    "county": "Nairobi",
    "town": "Ruaraka"
  },
  {
    "id": "inst-174",
    "code": "410",
    "name": "Roysambu Technical and Vocational College",
    "shortName": "Roysambu TVC",
    "type": "Technical College",
    "county": "Nairobi",
    "town": "Roysambu"
  },
  {
    "id": "inst-175",
    "code": "411",
    "name": "Makadara Technical and Vocational College",
    "shortName": "Makadara TVC",
    "type": "Technical College",
    "county": "Nairobi",
    "town": "Makadara"
  },
  {
    "id": "inst-176",
    "code": "412",
    "name": "Gatundu North Technical and Vocational College",
    "shortName": "Gatundu North TVC",
    "type": "Technical College",
    "county": "Kiambu",
    "town": "Gatundu North"
  },
  {
    "id": "inst-177",
    "code": "413",
    "name": "Gatundu South Technical and Vocational College",
    "shortName": "Gatundu South TVC",
    "type": "Technical College",
    "county": "Kiambu",
    "town": "Gatundu South"
  },
  {
    "id": "inst-178",
    "code": "414",
    "name": "Githunguri Technical and Vocational College",
    "shortName": "Githunguri TVC",
    "type": "Technical College",
    "county": "Kiambu",
    "town": "Githunguri"
  },
  {
    "id": "inst-179",
    "code": "415",
    "name": "Juja Technical and Vocational College",
    "shortName": "Juja TVC",
    "type": "Technical College",
    "county": "Kiambu",
    "town": "Juja"
  },
  {
    "id": "inst-180",
    "code": "416",
    "name": "Ruiru Technical and Vocational College",
    "shortName": "Ruiru TVC",
    "type": "Technical College",
    "county": "Kiambu",
    "town": "Ruiru"
  },
  {
    "id": "inst-181",
    "code": "417",
    "name": "Kikuyu Technical and Vocational College",
    "shortName": "Kikuyu TVC",
    "type": "Technical College",
    "county": "Kiambu",
    "town": "Kikuyu"
  },
  {
    "id": "inst-182",
    "code": "418",
    "name": "Kabete Technical and Vocational College",
    "shortName": "Kabete TVC",
    "type": "Technical College",
    "county": "Kiambu",
    "town": "Kabete"
  },
  {
    "id": "inst-183",
    "code": "419",
    "name": "Limuru Technical and Vocational College",
    "shortName": "Limuru TVC",
    "type": "Technical College",
    "county": "Kiambu",
    "town": "Limuru"
  },
  {
    "id": "inst-184",
    "code": "420",
    "name": "Lari Technical and Vocational College",
    "shortName": "Lari TVC",
    "type": "Technical College",
    "county": "Kiambu",
    "town": "Lari"
  },
  {
    "id": "inst-185",
    "code": "421",
    "name": "Thika Technical Training Institute",
    "shortName": "Thika TTI",
    "type": "Technical College",
    "county": "Kiambu",
    "town": "Thika"
  },
  {
    "id": "inst-186",
    "code": "422",
    "name": "Nachu Technical and Vocational College",
    "shortName": "Nachu TVC",
    "type": "Technical College",
    "county": "Kiambu",
    "town": "Nachu"
  },
  {
    "id": "inst-187",
    "code": "423",
    "name": "Changamwe Technical and Vocational College",
    "shortName": "Changamwe TVC",
    "type": "Technical College",
    "county": "Mombasa",
    "town": "Changamwe"
  },
  {
    "id": "inst-188",
    "code": "424",
    "name": "Jomvu Technical and Vocational College",
    "shortName": "Jomvu TVC",
    "type": "Technical College",
    "county": "Mombasa",
    "town": "Jomvu"
  },
  {
    "id": "inst-189",
    "code": "425",
    "name": "Kisauni Technical and Vocational College",
    "shortName": "Kisauni TVC",
    "type": "Technical College",
    "county": "Mombasa",
    "town": "Kisauni"
  },
  {
    "id": "inst-190",
    "code": "426",
    "name": "Nyali Technical and Vocational College",
    "shortName": "Nyali TVC",
    "type": "Technical College",
    "county": "Mombasa",
    "town": "Nyali"
  },
  {
    "id": "inst-191",
    "code": "427",
    "name": "Likoni Technical and Vocational College",
    "shortName": "Likoni TVC",
    "type": "Technical College",
    "county": "Mombasa",
    "town": "Likoni"
  },
  {
    "id": "inst-192",
    "code": "428",
    "name": "Mvita Technical and Vocational College",
    "shortName": "Mvita TVC",
    "type": "Technical College",
    "county": "Mombasa",
    "town": "Mvita"
  },
  {
    "id": "inst-193",
    "code": "429",
    "name": "Msambweni Technical and Vocational College",
    "shortName": "Msambweni TVC",
    "type": "Technical College",
    "county": "Kwale",
    "town": "Msambweni"
  },
  {
    "id": "inst-194",
    "code": "430",
    "name": "Lungalunga Technical and Vocational College",
    "shortName": "Lungalunga TVC",
    "type": "Technical College",
    "county": "Kwale",
    "town": "Lungalunga"
  },
  {
    "id": "inst-195",
    "code": "431",
    "name": "Matuga Technical and Vocational College",
    "shortName": "Matuga TVC",
    "type": "Technical College",
    "county": "Kwale",
    "town": "Matuga"
  },
  {
    "id": "inst-196",
    "code": "432",
    "name": "Kinango Technical and Vocational College",
    "shortName": "Kinango TVC",
    "type": "Technical College",
    "county": "Kwale",
    "town": "Kinango"
  },
  {
    "id": "inst-197",
    "code": "433",
    "name": "Samburu-Kwale Technical and Vocational College",
    "shortName": "Samburu-Kwale TVC",
    "type": "Technical College",
    "county": "Kwale",
    "town": "Samburu Kwale"
  },
  {
    "id": "inst-198",
    "code": "434",
    "name": "Mwereni Technical and Vocational College",
    "shortName": "Mwereni TVC",
    "type": "Technical College",
    "county": "Kwale",
    "town": "Mwereni"
  },
  {
    "id": "inst-199",
    "code": "435",
    "name": "Kaloleni Technical and Vocational College",
    "shortName": "Kaloleni TVC",
    "type": "Technical College",
    "county": "Kilifi",
    "town": "Kaloleni"
  },
  {
    "id": "inst-200",
    "code": "436",
    "name": "Rabai Technical and Vocational College",
    "shortName": "Rabai TVC",
    "type": "Technical College",
    "county": "Kilifi",
    "town": "Rabai"
  },
  {
    "id": "inst-201",
    "code": "437",
    "name": "Ganze Technical and Vocational College",
    "shortName": "Ganze TVC",
    "type": "Technical College",
    "county": "Kilifi",
    "town": "Ganze"
  },
  {
    "id": "inst-202",
    "code": "438",
    "name": "Malindi Technical and Vocational College",
    "shortName": "Malindi TVC",
    "type": "Technical College",
    "county": "Kilifi",
    "town": "Malindi"
  },
  {
    "id": "inst-203",
    "code": "439",
    "name": "Magarini Technical and Vocational College",
    "shortName": "Magarini TVC",
    "type": "Technical College",
    "county": "Kilifi",
    "town": "Magarini"
  },
  {
    "id": "inst-204",
    "code": "440",
    "name": "Kilifi North Technical and Vocational College",
    "shortName": "Kilifi North TVC",
    "type": "Technical College",
    "county": "Kilifi",
    "town": "Kilifi North"
  },
  {
    "id": "inst-205",
    "code": "441",
    "name": "Kilifi South Technical and Vocational College",
    "shortName": "Kilifi South TVC",
    "type": "Technical College",
    "county": "Kilifi",
    "town": "Kilifi South"
  },
  {
    "id": "inst-206",
    "code": "442",
    "name": "Marafa Technical and Vocational College",
    "shortName": "Marafa TVC",
    "type": "Technical College",
    "county": "Kilifi",
    "town": "Marafa"
  },
  {
    "id": "inst-207",
    "code": "443",
    "name": "Garsen Technical and Vocational College",
    "shortName": "Garsen TVC",
    "type": "Technical College",
    "county": "Tana River",
    "town": "Garsen"
  },
  {
    "id": "inst-208",
    "code": "444",
    "name": "Galole Technical and Vocational College",
    "shortName": "Galole TVC",
    "type": "Technical College",
    "county": "Tana River",
    "town": "Galole"
  },
  {
    "id": "inst-209",
    "code": "445",
    "name": "Bura Technical and Vocational College",
    "shortName": "Bura TVC",
    "type": "Technical College",
    "county": "Tana River",
    "town": "Bura"
  },
  {
    "id": "inst-210",
    "code": "446",
    "name": "Madogo Technical and Vocational College",
    "shortName": "Madogo TVC",
    "type": "Technical College",
    "county": "Tana River",
    "town": "Madogo"
  },
  {
    "id": "inst-211",
    "code": "447",
    "name": "Lamu West Technical and Vocational College",
    "shortName": "Lamu West TVC",
    "type": "Technical College",
    "county": "Lamu",
    "town": "Lamu West"
  },
  {
    "id": "inst-212",
    "code": "448",
    "name": "Lamu East Technical and Vocational College",
    "shortName": "Lamu East TVC",
    "type": "Technical College",
    "county": "Lamu",
    "town": "Lamu East"
  },
  {
    "id": "inst-213",
    "code": "449",
    "name": "Mpeketoni Technical and Vocational College",
    "shortName": "Mpeketoni TVC",
    "type": "Technical College",
    "county": "Lamu",
    "town": "Mpeketoni"
  },
  {
    "id": "inst-214",
    "code": "450",
    "name": "Faza Technical and Vocational College",
    "shortName": "Faza TVC",
    "type": "Technical College",
    "county": "Lamu",
    "town": "Faza"
  },
  {
    "id": "inst-215",
    "code": "451",
    "name": "Taveta Technical and Vocational College",
    "shortName": "Taveta TVC",
    "type": "Technical College",
    "county": "Taita Taveta",
    "town": "Taveta"
  },
  {
    "id": "inst-216",
    "code": "452",
    "name": "Wundanyi Technical and Vocational College",
    "shortName": "Wundanyi TVC",
    "type": "Technical College",
    "county": "Taita Taveta",
    "town": "Wundanyi"
  },
  {
    "id": "inst-217",
    "code": "453",
    "name": "Mwatate Technical and Vocational College",
    "shortName": "Mwatate TVC",
    "type": "Technical College",
    "county": "Taita Taveta",
    "town": "Mwatate"
  },
  {
    "id": "inst-218",
    "code": "454",
    "name": "Voi Technical and Vocational College",
    "shortName": "Voi TVC",
    "type": "Technical College",
    "county": "Taita Taveta",
    "town": "Voi"
  },
  {
    "id": "inst-219",
    "code": "455",
    "name": "Werugha Technical and Vocational College",
    "shortName": "Werugha TVC",
    "type": "Technical College",
    "county": "Taita Taveta",
    "town": "Werugha"
  },
  {
    "id": "inst-220",
    "code": "456",
    "name": "Garissa Township Technical and Vocational College",
    "shortName": "Garissa Township TVC",
    "type": "Technical College",
    "county": "Garissa",
    "town": "Garissa Township"
  },
  {
    "id": "inst-221",
    "code": "457",
    "name": "Balambala Technical and Vocational College",
    "shortName": "Balambala TVC",
    "type": "Technical College",
    "county": "Garissa",
    "town": "Balambala"
  },
  {
    "id": "inst-222",
    "code": "458",
    "name": "Lagdera Technical and Vocational College",
    "shortName": "Lagdera TVC",
    "type": "Technical College",
    "county": "Garissa",
    "town": "Lagdera"
  },
  {
    "id": "inst-223",
    "code": "459",
    "name": "Dadaab Technical and Vocational College",
    "shortName": "Dadaab TVC",
    "type": "Technical College",
    "county": "Garissa",
    "town": "Dadaab"
  },
  {
    "id": "inst-224",
    "code": "460",
    "name": "Fafi Technical and Vocational College",
    "shortName": "Fafi TVC",
    "type": "Technical College",
    "county": "Garissa",
    "town": "Fafi"
  },
  {
    "id": "inst-225",
    "code": "461",
    "name": "Ijara Technical and Vocational College",
    "shortName": "Ijara TVC",
    "type": "Technical College",
    "county": "Garissa",
    "town": "Ijara"
  },
  {
    "id": "inst-226",
    "code": "462",
    "name": "Hulugho Technical and Vocational College",
    "shortName": "Hulugho TVC",
    "type": "Technical College",
    "county": "Garissa",
    "town": "Hulugho"
  },
  {
    "id": "inst-227",
    "code": "463",
    "name": "Wajir East Technical and Vocational College",
    "shortName": "Wajir East TVC",
    "type": "Technical College",
    "county": "Wajir",
    "town": "Wajir East"
  },
  {
    "id": "inst-228",
    "code": "464",
    "name": "Tarbaj Technical and Vocational College",
    "shortName": "Tarbaj TVC",
    "type": "Technical College",
    "county": "Wajir",
    "town": "Tarbaj"
  },
  {
    "id": "inst-229",
    "code": "465",
    "name": "Wajir West Technical and Vocational College",
    "shortName": "Wajir West TVC",
    "type": "Technical College",
    "county": "Wajir",
    "town": "Wajir West"
  },
  {
    "id": "inst-230",
    "code": "466",
    "name": "Eldas Technical and Vocational College",
    "shortName": "Eldas TVC",
    "type": "Technical College",
    "county": "Wajir",
    "town": "Eldas"
  },
  {
    "id": "inst-231",
    "code": "467",
    "name": "Wajir North Technical and Vocational College",
    "shortName": "Wajir North TVC",
    "type": "Technical College",
    "county": "Wajir",
    "town": "Wajir North"
  },
  {
    "id": "inst-232",
    "code": "468",
    "name": "Wajir South Technical and Vocational College",
    "shortName": "Wajir South TVC",
    "type": "Technical College",
    "county": "Wajir",
    "town": "Wajir South"
  },
  {
    "id": "inst-233",
    "code": "469",
    "name": "Habaswein Technical and Vocational College",
    "shortName": "Habaswein TVC",
    "type": "Technical College",
    "county": "Wajir",
    "town": "Habaswein"
  },
  {
    "id": "inst-234",
    "code": "470",
    "name": "Mandera West Technical and Vocational College",
    "shortName": "Mandera West TVC",
    "type": "Technical College",
    "county": "Mandera",
    "town": "Mandera West"
  },
  {
    "id": "inst-235",
    "code": "471",
    "name": "Banissa Technical and Vocational College",
    "shortName": "Banissa TVC",
    "type": "Technical College",
    "county": "Mandera",
    "town": "Banissa"
  },
  {
    "id": "inst-236",
    "code": "472",
    "name": "Mandera North Technical and Vocational College",
    "shortName": "Mandera North TVC",
    "type": "Technical College",
    "county": "Mandera",
    "town": "Mandera North"
  },
  {
    "id": "inst-237",
    "code": "473",
    "name": "Mandera South Technical and Vocational College",
    "shortName": "Mandera South TVC",
    "type": "Technical College",
    "county": "Mandera",
    "town": "Mandera South"
  },
  {
    "id": "inst-238",
    "code": "474",
    "name": "Mandera East Technical and Vocational College",
    "shortName": "Mandera East TVC",
    "type": "Technical College",
    "county": "Mandera",
    "town": "Mandera East"
  },
  {
    "id": "inst-239",
    "code": "475",
    "name": "Lafey Technical and Vocational College",
    "shortName": "Lafey TVC",
    "type": "Technical College",
    "county": "Mandera",
    "town": "Lafey"
  },
  {
    "id": "inst-240",
    "code": "476",
    "name": "Rhamu Technical and Vocational College",
    "shortName": "Rhamu TVC",
    "type": "Technical College",
    "county": "Mandera",
    "town": "Rhamu"
  },
  {
    "id": "inst-241",
    "code": "477",
    "name": "Moyale Technical and Vocational College",
    "shortName": "Moyale TVC",
    "type": "Technical College",
    "county": "Marsabit",
    "town": "Moyale"
  },
  {
    "id": "inst-242",
    "code": "478",
    "name": "North Horr Technical and Vocational College",
    "shortName": "North Horr TVC",
    "type": "Technical College",
    "county": "Marsabit",
    "town": "North Horr"
  },
  {
    "id": "inst-243",
    "code": "479",
    "name": "Saku Technical and Vocational College",
    "shortName": "Saku TVC",
    "type": "Technical College",
    "county": "Marsabit",
    "town": "Saku"
  },
  {
    "id": "inst-244",
    "code": "480",
    "name": "Laisamis Technical and Vocational College",
    "shortName": "Laisamis TVC",
    "type": "Technical College",
    "county": "Marsabit",
    "town": "Laisamis"
  },
  {
    "id": "inst-245",
    "code": "481",
    "name": "Sololo Technical and Vocational College",
    "shortName": "Sololo TVC",
    "type": "Technical College",
    "county": "Marsabit",
    "town": "Sololo"
  },
  {
    "id": "inst-246",
    "code": "482",
    "name": "Isiolo North Technical and Vocational College",
    "shortName": "Isiolo North TVC",
    "type": "Technical College",
    "county": "Isiolo",
    "town": "Isiolo North"
  },
  {
    "id": "inst-247",
    "code": "483",
    "name": "Isiolo South Technical and Vocational College",
    "shortName": "Isiolo South TVC",
    "type": "Technical College",
    "county": "Isiolo",
    "town": "Isiolo South"
  },
  {
    "id": "inst-248",
    "code": "484",
    "name": "Garbatulla Technical and Vocational College",
    "shortName": "Garbatulla TVC",
    "type": "Technical College",
    "county": "Isiolo",
    "town": "Garbatulla"
  },
  {
    "id": "inst-249",
    "code": "485",
    "name": "Merti Technical and Vocational College",
    "shortName": "Merti TVC",
    "type": "Technical College",
    "county": "Isiolo",
    "town": "Merti"
  },
  {
    "id": "inst-250",
    "code": "486",
    "name": "Igembe South Technical and Vocational College",
    "shortName": "Igembe South TVC",
    "type": "Technical College",
    "county": "Meru",
    "town": "Igembe South"
  },
  {
    "id": "inst-251",
    "code": "487",
    "name": "Igembe Central Technical and Vocational College",
    "shortName": "Igembe Central TVC",
    "type": "Technical College",
    "county": "Meru",
    "town": "Igembe Central"
  },
  {
    "id": "inst-252",
    "code": "488",
    "name": "Igembe North Technical and Vocational College",
    "shortName": "Igembe North TVC",
    "type": "Technical College",
    "county": "Meru",
    "town": "Igembe North"
  },
  {
    "id": "inst-253",
    "code": "489",
    "name": "Tigania West Technical and Vocational College",
    "shortName": "Tigania West TVC",
    "type": "Technical College",
    "county": "Meru",
    "town": "Tigania West"
  },
  {
    "id": "inst-254",
    "code": "490",
    "name": "Tigania East Technical and Vocational College",
    "shortName": "Tigania East TVC",
    "type": "Technical College",
    "county": "Meru",
    "town": "Tigania East"
  },
  {
    "id": "inst-255",
    "code": "491",
    "name": "North Imenti Technical and Vocational College",
    "shortName": "North Imenti TVC",
    "type": "Technical College",
    "county": "Meru",
    "town": "North Imenti"
  },
  {
    "id": "inst-256",
    "code": "492",
    "name": "Buuri Technical and Vocational College",
    "shortName": "Buuri TVC",
    "type": "Technical College",
    "county": "Meru",
    "town": "Buuri"
  },
  {
    "id": "inst-257",
    "code": "493",
    "name": "Central Imenti Technical and Vocational College",
    "shortName": "Central Imenti TVC",
    "type": "Technical College",
    "county": "Meru",
    "town": "Central Imenti"
  },
  {
    "id": "inst-258",
    "code": "494",
    "name": "South Imenti Technical and Vocational College",
    "shortName": "South Imenti TVC",
    "type": "Technical College",
    "county": "Meru",
    "town": "South Imenti"
  },
  {
    "id": "inst-259",
    "code": "495",
    "name": "Nkubu Technical and Vocational College",
    "shortName": "Nkubu TVC",
    "type": "Technical College",
    "county": "Meru",
    "town": "Nkubu"
  },
  {
    "id": "inst-260",
    "code": "496",
    "name": "Maua Technical and Vocational College",
    "shortName": "Maua TVC",
    "type": "Technical College",
    "county": "Meru",
    "town": "Maua"
  },
  {
    "id": "inst-261",
    "code": "497",
    "name": "Maara Technical and Vocational College",
    "shortName": "Maara TVC",
    "type": "Technical College",
    "county": "Tharaka Nithi",
    "town": "Maara"
  },
  {
    "id": "inst-262",
    "code": "498",
    "name": "Chuka Technical and Vocational College",
    "shortName": "Chuka TVC",
    "type": "Technical College",
    "county": "Tharaka Nithi",
    "town": "Chuka"
  },
  {
    "id": "inst-263",
    "code": "499",
    "name": "Tharaka North Technical and Vocational College",
    "shortName": "Tharaka North TVC",
    "type": "Technical College",
    "county": "Tharaka Nithi",
    "town": "Tharaka North"
  },
  {
    "id": "inst-264",
    "code": "500",
    "name": "Tharaka South Technical and Vocational College",
    "shortName": "Tharaka South TVC",
    "type": "Technical College",
    "county": "Tharaka Nithi",
    "town": "Tharaka South"
  },
  {
    "id": "inst-265",
    "code": "501",
    "name": "Muthambi Technical and Vocational College",
    "shortName": "Muthambi TVC",
    "type": "Technical College",
    "county": "Tharaka Nithi",
    "town": "Muthambi"
  },
  {
    "id": "inst-266",
    "code": "502",
    "name": "Manyatta Technical and Vocational College",
    "shortName": "Manyatta TVC",
    "type": "Technical College",
    "county": "Embu",
    "town": "Manyatta"
  },
  {
    "id": "inst-267",
    "code": "503",
    "name": "Runyenjes Technical and Vocational College",
    "shortName": "Runyenjes TVC",
    "type": "Technical College",
    "county": "Embu",
    "town": "Runyenjes"
  },
  {
    "id": "inst-268",
    "code": "504",
    "name": "Mbeere South Technical and Vocational College",
    "shortName": "Mbeere South TVC",
    "type": "Technical College",
    "county": "Embu",
    "town": "Mbeere South"
  },
  {
    "id": "inst-269",
    "code": "505",
    "name": "Mbeere North Technical and Vocational College",
    "shortName": "Mbeere North TVC",
    "type": "Technical College",
    "county": "Embu",
    "town": "Mbeere North"
  },
  {
    "id": "inst-270",
    "code": "506",
    "name": "Siakago Technical and Vocational College",
    "shortName": "Siakago TVC",
    "type": "Technical College",
    "county": "Embu",
    "town": "Siakago"
  },
  {
    "id": "inst-271",
    "code": "507",
    "name": "Kanja Technical and Vocational College",
    "shortName": "Kanja TVC",
    "type": "Technical College",
    "county": "Embu",
    "town": "Kanja"
  },
  {
    "id": "inst-272",
    "code": "508",
    "name": "Mwingi North Technical and Vocational College",
    "shortName": "Mwingi North TVC",
    "type": "Technical College",
    "county": "Kitui",
    "town": "Mwingi North"
  },
  {
    "id": "inst-273",
    "code": "509",
    "name": "Mwingi West Technical and Vocational College",
    "shortName": "Mwingi West TVC",
    "type": "Technical College",
    "county": "Kitui",
    "town": "Mwingi West"
  },
  {
    "id": "inst-274",
    "code": "510",
    "name": "Mwingi Central Technical and Vocational College",
    "shortName": "Mwingi Central TVC",
    "type": "Technical College",
    "county": "Kitui",
    "town": "Mwingi Central"
  },
  {
    "id": "inst-275",
    "code": "511",
    "name": "Kitui West Technical and Vocational College",
    "shortName": "Kitui West TVC",
    "type": "Technical College",
    "county": "Kitui",
    "town": "Kitui West"
  },
  {
    "id": "inst-276",
    "code": "512",
    "name": "Kitui Rural Technical and Vocational College",
    "shortName": "Kitui Rural TVC",
    "type": "Technical College",
    "county": "Kitui",
    "town": "Kitui Rural"
  },
  {
    "id": "inst-277",
    "code": "513",
    "name": "Kitui Central Technical and Vocational College",
    "shortName": "Kitui Central TVC",
    "type": "Technical College",
    "county": "Kitui",
    "town": "Kitui Central"
  },
  {
    "id": "inst-278",
    "code": "514",
    "name": "Kitui East Technical and Vocational College",
    "shortName": "Kitui East TVC",
    "type": "Technical College",
    "county": "Kitui",
    "town": "Kitui East"
  },
  {
    "id": "inst-279",
    "code": "515",
    "name": "Kitui South Technical and Vocational College",
    "shortName": "Kitui South TVC",
    "type": "Technical College",
    "county": "Kitui",
    "town": "Kitui South"
  },
  {
    "id": "inst-280",
    "code": "516",
    "name": "Mutomo Technical and Vocational College",
    "shortName": "Mutomo TVC",
    "type": "Technical College",
    "county": "Kitui",
    "town": "Mutomo"
  },
  {
    "id": "inst-281",
    "code": "517",
    "name": "Kyuso Technical and Vocational College",
    "shortName": "Kyuso TVC",
    "type": "Technical College",
    "county": "Kitui",
    "town": "Kyuso"
  },
  {
    "id": "inst-282",
    "code": "518",
    "name": "Masinga Technical and Vocational College",
    "shortName": "Masinga TVC",
    "type": "Technical College",
    "county": "Machakos",
    "town": "Masinga"
  },
  {
    "id": "inst-283",
    "code": "519",
    "name": "Yatta Technical and Vocational College",
    "shortName": "Yatta TVC",
    "type": "Technical College",
    "county": "Machakos",
    "town": "Yatta"
  },
  {
    "id": "inst-284",
    "code": "520",
    "name": "Kangundo Technical and Vocational College",
    "shortName": "Kangundo TVC",
    "type": "Technical College",
    "county": "Machakos",
    "town": "Kangundo"
  },
  {
    "id": "inst-285",
    "code": "521",
    "name": "Matungulu Technical and Vocational College",
    "shortName": "Matungulu TVC",
    "type": "Technical College",
    "county": "Machakos",
    "town": "Matungulu"
  },
  {
    "id": "inst-286",
    "code": "522",
    "name": "Kathiani Technical and Vocational College",
    "shortName": "Kathiani TVC",
    "type": "Technical College",
    "county": "Machakos",
    "town": "Kathiani"
  },
  {
    "id": "inst-287",
    "code": "523",
    "name": "Mavoko Technical and Vocational College",
    "shortName": "Mavoko TVC",
    "type": "Technical College",
    "county": "Machakos",
    "town": "Mavoko"
  },
  {
    "id": "inst-288",
    "code": "524",
    "name": "Machakos Town Technical and Vocational College",
    "shortName": "Machakos Town TVC",
    "type": "Technical College",
    "county": "Machakos",
    "town": "Machakos Town"
  },
  {
    "id": "inst-289",
    "code": "525",
    "name": "Mwala Technical and Vocational College",
    "shortName": "Mwala TVC",
    "type": "Technical College",
    "county": "Machakos",
    "town": "Mwala"
  },
  {
    "id": "inst-290",
    "code": "526",
    "name": "Tala Technical and Vocational College",
    "shortName": "Tala TVC",
    "type": "Technical College",
    "county": "Machakos",
    "town": "Tala"
  },
  {
    "id": "inst-291",
    "code": "527",
    "name": "Kithimani Technical and Vocational College",
    "shortName": "Kithimani TVC",
    "type": "Technical College",
    "county": "Machakos",
    "town": "Kithimani"
  },
  {
    "id": "inst-292",
    "code": "528",
    "name": "Mbooni Technical and Vocational College",
    "shortName": "Mbooni TVC",
    "type": "Technical College",
    "county": "Makueni",
    "town": "Mbooni"
  },
  {
    "id": "inst-293",
    "code": "529",
    "name": "Kilome Technical and Vocational College",
    "shortName": "Kilome TVC",
    "type": "Technical College",
    "county": "Makueni",
    "town": "Kilome"
  },
  {
    "id": "inst-294",
    "code": "530",
    "name": "Kaiti Technical and Vocational College",
    "shortName": "Kaiti TVC",
    "type": "Technical College",
    "county": "Makueni",
    "town": "Kaiti"
  },
  {
    "id": "inst-295",
    "code": "531",
    "name": "Makueni Technical and Vocational College",
    "shortName": "Makueni TVC",
    "type": "Technical College",
    "county": "Makueni",
    "town": "Makueni"
  },
  {
    "id": "inst-296",
    "code": "532",
    "name": "Kibwezi West Technical and Vocational College",
    "shortName": "Kibwezi West TVC",
    "type": "Technical College",
    "county": "Makueni",
    "town": "Kibwezi West"
  },
  {
    "id": "inst-297",
    "code": "533",
    "name": "Kibwezi East Technical and Vocational College",
    "shortName": "Kibwezi East TVC",
    "type": "Technical College",
    "county": "Makueni",
    "town": "Kibwezi East"
  },
  {
    "id": "inst-298",
    "code": "534",
    "name": "Emali Technical and Vocational College",
    "shortName": "Emali TVC",
    "type": "Technical College",
    "county": "Makueni",
    "town": "Emali"
  },
  {
    "id": "inst-299",
    "code": "535",
    "name": "Makindu Technical and Vocational College",
    "shortName": "Makindu TVC",
    "type": "Technical College",
    "county": "Makueni",
    "town": "Makindu"
  },
  {
    "id": "inst-300",
    "code": "536",
    "name": "Kinangop Technical and Vocational College",
    "shortName": "Kinangop TVC",
    "type": "Technical College",
    "county": "Nyandarua",
    "town": "Kinangop"
  },
  {
    "id": "inst-301",
    "code": "537",
    "name": "Kipipiri Technical and Vocational College",
    "shortName": "Kipipiri TVC",
    "type": "Technical College",
    "county": "Nyandarua",
    "town": "Kipipiri"
  },
  {
    "id": "inst-302",
    "code": "538",
    "name": "Ol Kalou Technical and Vocational College",
    "shortName": "Ol Kalou TVC",
    "type": "Technical College",
    "county": "Nyandarua",
    "town": "Ol Kalou"
  },
  {
    "id": "inst-303",
    "code": "539",
    "name": "Ol Jorok Technical and Vocational College",
    "shortName": "Ol Jorok TVC",
    "type": "Technical College",
    "county": "Nyandarua",
    "town": "Ol Jorok"
  },
  {
    "id": "inst-304",
    "code": "540",
    "name": "Ndaragwa Technical and Vocational College",
    "shortName": "Ndaragwa TVC",
    "type": "Technical College",
    "county": "Nyandarua",
    "town": "Ndaragwa"
  },
  {
    "id": "inst-305",
    "code": "541",
    "name": "Engineer Technical and Vocational College",
    "shortName": "Engineer TVC",
    "type": "Technical College",
    "county": "Nyandarua",
    "town": "Engineer"
  },
  {
    "id": "inst-306",
    "code": "542",
    "name": "Shamata Technical and Vocational College",
    "shortName": "Shamata TVC",
    "type": "Technical College",
    "county": "Nyandarua",
    "town": "Shamata"
  },
  {
    "id": "inst-307",
    "code": "543",
    "name": "Tetu Technical and Vocational College",
    "shortName": "Tetu TVC",
    "type": "Technical College",
    "county": "Nyeri",
    "town": "Tetu"
  },
  {
    "id": "inst-308",
    "code": "544",
    "name": "Kieni East Technical and Vocational College",
    "shortName": "Kieni East TVC",
    "type": "Technical College",
    "county": "Nyeri",
    "town": "Kieni East"
  },
  {
    "id": "inst-309",
    "code": "545",
    "name": "Kieni West Technical and Vocational College",
    "shortName": "Kieni West TVC",
    "type": "Technical College",
    "county": "Nyeri",
    "town": "Kieni West"
  },
  {
    "id": "inst-310",
    "code": "546",
    "name": "Mathira East Technical and Vocational College",
    "shortName": "Mathira East TVC",
    "type": "Technical College",
    "county": "Nyeri",
    "town": "Mathira East"
  },
  {
    "id": "inst-311",
    "code": "547",
    "name": "Mathira West Technical and Vocational College",
    "shortName": "Mathira West TVC",
    "type": "Technical College",
    "county": "Nyeri",
    "town": "Mathira West"
  },
  {
    "id": "inst-312",
    "code": "548",
    "name": "Othaya Technical and Vocational College",
    "shortName": "Othaya TVC",
    "type": "Technical College",
    "county": "Nyeri",
    "town": "Othaya"
  },
  {
    "id": "inst-313",
    "code": "549",
    "name": "Mukurwe-ini Technical and Vocational College",
    "shortName": "Mukurwe-ini TVC",
    "type": "Technical College",
    "county": "Nyeri",
    "town": "Mukurwe-ini"
  },
  {
    "id": "inst-314",
    "code": "550",
    "name": "Nyeri Central Technical and Vocational College",
    "shortName": "Nyeri Central TVC",
    "type": "Technical College",
    "county": "Nyeri",
    "town": "Nyeri Town"
  },
  {
    "id": "inst-315",
    "code": "551",
    "name": "Mwea East Technical and Vocational College",
    "shortName": "Mwea East TVC",
    "type": "Technical College",
    "county": "Kirinyaga",
    "town": "Mwea East"
  },
  {
    "id": "inst-316",
    "code": "552",
    "name": "Mwea West Technical and Vocational College",
    "shortName": "Mwea West TVC",
    "type": "Technical College",
    "county": "Kirinyaga",
    "town": "Mwea West"
  },
  {
    "id": "inst-317",
    "code": "553",
    "name": "Gichugu Technical and Vocational College",
    "shortName": "Gichugu TVC",
    "type": "Technical College",
    "county": "Kirinyaga",
    "town": "Gichugu"
  },
  {
    "id": "inst-318",
    "code": "554",
    "name": "Ndia Technical and Vocational College",
    "shortName": "Ndia TVC",
    "type": "Technical College",
    "county": "Kirinyaga",
    "town": "Ndia"
  },
  {
    "id": "inst-319",
    "code": "555",
    "name": "Kirinyaga Central Technical and Vocational College",
    "shortName": "Kirinyaga Central TVC",
    "type": "Technical College",
    "county": "Kirinyaga",
    "town": "Kirinyaga Central"
  },
  {
    "id": "inst-320",
    "code": "556",
    "name": "Kerugoya Technical and Vocational College",
    "shortName": "Kerugoya TVC",
    "type": "Technical College",
    "county": "Kirinyaga",
    "town": "Kerugoya"
  },
  {
    "id": "inst-321",
    "code": "557",
    "name": "Kangema Technical and Vocational College",
    "shortName": "Kangema TVC",
    "type": "Technical College",
    "county": "Murang'a",
    "town": "Kangema"
  },
  {
    "id": "inst-322",
    "code": "558",
    "name": "Mathioya Technical and Vocational College",
    "shortName": "Mathioya TVC",
    "type": "Technical College",
    "county": "Murang'a",
    "town": "Mathioya"
  },
  {
    "id": "inst-323",
    "code": "559",
    "name": "Kiharu Technical and Vocational College",
    "shortName": "Kiharu TVC",
    "type": "Technical College",
    "county": "Murang'a",
    "town": "Kiharu"
  },
  {
    "id": "inst-324",
    "code": "560",
    "name": "Kigumo Technical and Vocational College",
    "shortName": "Kigumo TVC",
    "type": "Technical College",
    "county": "Murang'a",
    "town": "Kigumo"
  },
  {
    "id": "inst-325",
    "code": "561",
    "name": "Maragua Technical and Vocational College",
    "shortName": "Maragua TVC",
    "type": "Technical College",
    "county": "Murang'a",
    "town": "Maragua"
  },
  {
    "id": "inst-326",
    "code": "562",
    "name": "Kandara Technical and Vocational College",
    "shortName": "Kandara TVC",
    "type": "Technical College",
    "county": "Murang'a",
    "town": "Kandara"
  },
  {
    "id": "inst-327",
    "code": "563",
    "name": "Gatanga Technical and Vocational College",
    "shortName": "Gatanga TVC",
    "type": "Technical College",
    "county": "Murang'a",
    "town": "Gatanga"
  },
  {
    "id": "inst-328",
    "code": "564",
    "name": "Kirwara Technical and Vocational College",
    "shortName": "Kirwara TVC",
    "type": "Technical College",
    "county": "Murang'a",
    "town": "Kirwara"
  },
  {
    "id": "inst-329",
    "code": "565",
    "name": "Turkana North Technical and Vocational College",
    "shortName": "Turkana North TVC",
    "type": "Technical College",
    "county": "Turkana",
    "town": "Turkana North"
  },
  {
    "id": "inst-330",
    "code": "566",
    "name": "Turkana West Technical and Vocational College",
    "shortName": "Turkana West TVC",
    "type": "Technical College",
    "county": "Turkana",
    "town": "Turkana West"
  },
  {
    "id": "inst-331",
    "code": "567",
    "name": "Turkana Central Technical and Vocational College",
    "shortName": "Turkana Central TVC",
    "type": "Technical College",
    "county": "Turkana",
    "town": "Turkana Central"
  },
  {
    "id": "inst-332",
    "code": "568",
    "name": "Loima Technical and Vocational College",
    "shortName": "Loima TVC",
    "type": "Technical College",
    "county": "Turkana",
    "town": "Loima"
  },
  {
    "id": "inst-333",
    "code": "569",
    "name": "Turkana South Technical and Vocational College",
    "shortName": "Turkana South TVC",
    "type": "Technical College",
    "county": "Turkana",
    "town": "Turkana South"
  },
  {
    "id": "inst-334",
    "code": "570",
    "name": "Turkana East Technical and Vocational College",
    "shortName": "Turkana East TVC",
    "type": "Technical College",
    "county": "Turkana",
    "town": "Turkana East"
  },
  {
    "id": "inst-335",
    "code": "571",
    "name": "Lokichoggio Technical and Vocational College",
    "shortName": "Lokichoggio TVC",
    "type": "Technical College",
    "county": "Turkana",
    "town": "Lokichoggio"
  },
  {
    "id": "inst-336",
    "code": "572",
    "name": "Kakuma Technical and Vocational College",
    "shortName": "Kakuma TVC",
    "type": "Technical College",
    "county": "Turkana",
    "town": "Kakuma"
  },
  {
    "id": "inst-337",
    "code": "573",
    "name": "Kapenguria Technical and Vocational College",
    "shortName": "Kapenguria TVC",
    "type": "Technical College",
    "county": "West Pokot",
    "town": "Kapenguria"
  },
  {
    "id": "inst-338",
    "code": "574",
    "name": "Sigor Technical and Vocational College",
    "shortName": "Sigor TVC",
    "type": "Technical College",
    "county": "West Pokot",
    "town": "Sigor"
  },
  {
    "id": "inst-339",
    "code": "575",
    "name": "Kacheliba Technical and Vocational College",
    "shortName": "Kacheliba TVC",
    "type": "Technical College",
    "county": "West Pokot",
    "town": "Kacheliba"
  },
  {
    "id": "inst-340",
    "code": "576",
    "name": "Pokot South Technical and Vocational College",
    "shortName": "Pokot South TVC",
    "type": "Technical College",
    "county": "West Pokot",
    "town": "Pokot South"
  },
  {
    "id": "inst-341",
    "code": "577",
    "name": "Chepareria Technical and Vocational College",
    "shortName": "Chepareria TVC",
    "type": "Technical College",
    "county": "West Pokot",
    "town": "Chepareria"
  },
  {
    "id": "inst-342",
    "code": "578",
    "name": "Samburu West Technical and Vocational College",
    "shortName": "Samburu West TVC",
    "type": "Technical College",
    "county": "Samburu",
    "town": "Samburu West"
  },
  {
    "id": "inst-343",
    "code": "579",
    "name": "Samburu North Technical and Vocational College",
    "shortName": "Samburu North TVC",
    "type": "Technical College",
    "county": "Samburu",
    "town": "Samburu North"
  },
  {
    "id": "inst-344",
    "code": "580",
    "name": "Samburu East Technical and Vocational College",
    "shortName": "Samburu East TVC",
    "type": "Technical College",
    "county": "Samburu",
    "town": "Samburu East"
  },
  {
    "id": "inst-345",
    "code": "581",
    "name": "Baragoi Technical and Vocational College",
    "shortName": "Baragoi TVC",
    "type": "Technical College",
    "county": "Samburu",
    "town": "Baragoi"
  },
  {
    "id": "inst-346",
    "code": "582",
    "name": "Wamba Technical and Vocational College",
    "shortName": "Wamba TVC",
    "type": "Technical College",
    "county": "Samburu",
    "town": "Wamba"
  },
  {
    "id": "inst-347",
    "code": "583",
    "name": "Kwanza Technical and Vocational College",
    "shortName": "Kwanza TVC",
    "type": "Technical College",
    "county": "Trans Nzoia",
    "town": "Kwanza"
  },
  {
    "id": "inst-348",
    "code": "584",
    "name": "Endebess Technical and Vocational College",
    "shortName": "Endebess TVC",
    "type": "Technical College",
    "county": "Trans Nzoia",
    "town": "Endebess"
  },
  {
    "id": "inst-349",
    "code": "585",
    "name": "Saboti Technical and Vocational College",
    "shortName": "Saboti TVC",
    "type": "Technical College",
    "county": "Trans Nzoia",
    "town": "Saboti"
  },
  {
    "id": "inst-350",
    "code": "586",
    "name": "Kiminini Technical and Vocational College",
    "shortName": "Kiminini TVC",
    "type": "Technical College",
    "county": "Trans Nzoia",
    "town": "Kiminini"
  },
  {
    "id": "inst-351",
    "code": "587",
    "name": "Cherangany Technical and Vocational College",
    "shortName": "Cherangany TVC",
    "type": "Technical College",
    "county": "Trans Nzoia",
    "town": "Cherangany"
  },
  {
    "id": "inst-352",
    "code": "588",
    "name": "Soy Technical and Vocational College",
    "shortName": "Soy TVC",
    "type": "Technical College",
    "county": "Uasin Gishu",
    "town": "Soy"
  },
  {
    "id": "inst-353",
    "code": "589",
    "name": "Turbo Technical and Vocational College",
    "shortName": "Turbo TVC",
    "type": "Technical College",
    "county": "Uasin Gishu",
    "town": "Turbo"
  },
  {
    "id": "inst-354",
    "code": "590",
    "name": "Moiben Technical and Vocational College",
    "shortName": "Moiben TVC",
    "type": "Technical College",
    "county": "Uasin Gishu",
    "town": "Moiben"
  },
  {
    "id": "inst-355",
    "code": "591",
    "name": "Ainabkoi Technical and Vocational College",
    "shortName": "Ainabkoi TVC",
    "type": "Technical College",
    "county": "Uasin Gishu",
    "town": "Ainabkoi"
  },
  {
    "id": "inst-356",
    "code": "592",
    "name": "Kapseret Technical and Vocational College",
    "shortName": "Kapseret TVC",
    "type": "Technical College",
    "county": "Uasin Gishu",
    "town": "Kapseret"
  },
  {
    "id": "inst-357",
    "code": "593",
    "name": "Kesses Technical and Vocational College",
    "shortName": "Kesses TVC",
    "type": "Technical College",
    "county": "Uasin Gishu",
    "town": "Kesses"
  },
  {
    "id": "inst-358",
    "code": "594",
    "name": "Kipkabus Technical and Vocational College",
    "shortName": "Kipkabus TVC",
    "type": "Technical College",
    "county": "Uasin Gishu",
    "town": "Kipkabus"
  },
  {
    "id": "inst-359",
    "code": "595",
    "name": "Marakwet East Technical and Vocational College",
    "shortName": "Marakwet East TVC",
    "type": "Technical College",
    "county": "Elgeyo Marakwet",
    "town": "Marakwet East"
  },
  {
    "id": "inst-360",
    "code": "596",
    "name": "Marakwet West Technical and Vocational College",
    "shortName": "Marakwet West TVC",
    "type": "Technical College",
    "county": "Elgeyo Marakwet",
    "town": "Marakwet West"
  },
  {
    "id": "inst-361",
    "code": "597",
    "name": "Keiyo North Technical and Vocational College",
    "shortName": "Keiyo North TVC",
    "type": "Technical College",
    "county": "Elgeyo Marakwet",
    "town": "Keiyo North"
  },
  {
    "id": "inst-362",
    "code": "598",
    "name": "Keiyo South Technical and Vocational College",
    "shortName": "Keiyo South TVC",
    "type": "Technical College",
    "county": "Elgeyo Marakwet",
    "town": "Keiyo South"
  },
  {
    "id": "inst-363",
    "code": "599",
    "name": "Kapsowar Technical and Vocational College",
    "shortName": "Kapsowar TVC",
    "type": "Technical College",
    "county": "Elgeyo Marakwet",
    "town": "Kapsowar"
  },
  {
    "id": "inst-364",
    "code": "600",
    "name": "Tindiret Technical and Vocational College",
    "shortName": "Tindiret TVC",
    "type": "Technical College",
    "county": "Nandi",
    "town": "Tindiret"
  },
  {
    "id": "inst-365",
    "code": "601",
    "name": "Aldai Technical and Vocational College",
    "shortName": "Aldai TVC",
    "type": "Technical College",
    "county": "Nandi",
    "town": "Aldai"
  },
  {
    "id": "inst-366",
    "code": "602",
    "name": "Nandi Hills Technical and Vocational College",
    "shortName": "Nandi Hills TVC",
    "type": "Technical College",
    "county": "Nandi",
    "town": "Nandi Hills"
  },
  {
    "id": "inst-367",
    "code": "603",
    "name": "Chesumei Technical and Vocational College",
    "shortName": "Chesumei TVC",
    "type": "Technical College",
    "county": "Nandi",
    "town": "Chesumei"
  },
  {
    "id": "inst-368",
    "code": "604",
    "name": "Emgwen Technical and Vocational College",
    "shortName": "Emgwen TVC",
    "type": "Technical College",
    "county": "Nandi",
    "town": "Emgwen"
  },
  {
    "id": "inst-369",
    "code": "605",
    "name": "Mosop Technical and Vocational College",
    "shortName": "Mosop TVC",
    "type": "Technical College",
    "county": "Nandi",
    "town": "Mosop"
  },
  {
    "id": "inst-370",
    "code": "606",
    "name": "Kapsabet Technical and Vocational College",
    "shortName": "Kapsabet TVC",
    "type": "Technical College",
    "county": "Nandi",
    "town": "Kapsabet"
  },
  {
    "id": "inst-371",
    "code": "607",
    "name": "Tiaty Technical and Vocational College",
    "shortName": "Tiaty TVC",
    "type": "Technical College",
    "county": "Baringo",
    "town": "Tiaty"
  },
  {
    "id": "inst-372",
    "code": "608",
    "name": "Baringo North Technical and Vocational College",
    "shortName": "Baringo North TVC",
    "type": "Technical College",
    "county": "Baringo",
    "town": "Baringo North"
  },
  {
    "id": "inst-373",
    "code": "609",
    "name": "Baringo Central Technical and Vocational College",
    "shortName": "Baringo Central TVC",
    "type": "Technical College",
    "county": "Baringo",
    "town": "Baringo Central"
  },
  {
    "id": "inst-374",
    "code": "610",
    "name": "Baringo South Technical and Vocational College",
    "shortName": "Baringo South TVC",
    "type": "Technical College",
    "county": "Baringo",
    "town": "Baringo South"
  },
  {
    "id": "inst-375",
    "code": "611",
    "name": "Mogotio Technical and Vocational College",
    "shortName": "Mogotio TVC",
    "type": "Technical College",
    "county": "Baringo",
    "town": "Mogotio"
  },
  {
    "id": "inst-376",
    "code": "612",
    "name": "Eldama Ravine Technical and Vocational College",
    "shortName": "Eldama Ravine TVC",
    "type": "Technical College",
    "county": "Baringo",
    "town": "Eldama Ravine"
  },
  {
    "id": "inst-377",
    "code": "613",
    "name": "Marigat Technical and Vocational College",
    "shortName": "Marigat TVC",
    "type": "Technical College",
    "county": "Baringo",
    "town": "Marigat"
  },
  {
    "id": "inst-378",
    "code": "614",
    "name": "Laikipia West Technical and Vocational College",
    "shortName": "Laikipia West TVC",
    "type": "Technical College",
    "county": "Laikipia",
    "town": "Laikipia West"
  },
  {
    "id": "inst-379",
    "code": "615",
    "name": "Laikipia East Technical and Vocational College",
    "shortName": "Laikipia East TVC",
    "type": "Technical College",
    "county": "Laikipia",
    "town": "Laikipia East"
  },
  {
    "id": "inst-380",
    "code": "616",
    "name": "Laikipia North Technical and Vocational College",
    "shortName": "Laikipia North TVC",
    "type": "Technical College",
    "county": "Laikipia",
    "town": "Laikipia North"
  },
  {
    "id": "inst-381",
    "code": "617",
    "name": "Nanyuki Technical and Vocational College",
    "shortName": "Nanyuki TVC",
    "type": "Technical College",
    "county": "Laikipia",
    "town": "Nanyuki"
  },
  {
    "id": "inst-382",
    "code": "618",
    "name": "Rumuruti Technical and Vocational College",
    "shortName": "Rumuruti TVC",
    "type": "Technical College",
    "county": "Laikipia",
    "town": "Rumuruti"
  },
  {
    "id": "inst-383",
    "code": "619",
    "name": "Kinamba Technical and Vocational College",
    "shortName": "Kinamba TVC",
    "type": "Technical College",
    "county": "Laikipia",
    "town": "Kinamba"
  },
  {
    "id": "inst-384",
    "code": "620",
    "name": "Molo Technical and Vocational College",
    "shortName": "Molo TVC",
    "type": "Technical College",
    "county": "Nakuru",
    "town": "Molo"
  },
  {
    "id": "inst-385",
    "code": "621",
    "name": "Njoro Technical and Vocational College",
    "shortName": "Njoro TVC",
    "type": "Technical College",
    "county": "Nakuru",
    "town": "Njoro"
  },
  {
    "id": "inst-386",
    "code": "622",
    "name": "Naivasha Technical and Vocational College",
    "shortName": "Naivasha TVC",
    "type": "Technical College",
    "county": "Nakuru",
    "town": "Naivasha"
  },
  {
    "id": "inst-387",
    "code": "623",
    "name": "Gilgil Technical and Vocational College",
    "shortName": "Gilgil TVC",
    "type": "Technical College",
    "county": "Nakuru",
    "town": "Gilgil"
  },
  {
    "id": "inst-388",
    "code": "624",
    "name": "Kuresoi South Technical and Vocational College",
    "shortName": "Kuresoi South TVC",
    "type": "Technical College",
    "county": "Nakuru",
    "town": "Kuresoi South"
  },
  {
    "id": "inst-389",
    "code": "625",
    "name": "Kuresoi North Technical and Vocational College",
    "shortName": "Kuresoi North TVC",
    "type": "Technical College",
    "county": "Nakuru",
    "town": "Kuresoi North"
  },
  {
    "id": "inst-390",
    "code": "626",
    "name": "Subukia Technical and Vocational College",
    "shortName": "Subukia TVC",
    "type": "Technical College",
    "county": "Nakuru",
    "town": "Subukia"
  },
  {
    "id": "inst-391",
    "code": "627",
    "name": "Rongai Technical and Vocational College",
    "shortName": "Rongai TVC",
    "type": "Technical College",
    "county": "Nakuru",
    "town": "Rongai"
  },
  {
    "id": "inst-392",
    "code": "628",
    "name": "Bahati Technical and Vocational College",
    "shortName": "Bahati TVC",
    "type": "Technical College",
    "county": "Nakuru",
    "town": "Bahati"
  },
  {
    "id": "inst-393",
    "code": "629",
    "name": "Nakuru Town West Technical and Vocational College",
    "shortName": "Nakuru Town West TVC",
    "type": "Technical College",
    "county": "Nakuru",
    "town": "Nakuru Town West"
  },
  {
    "id": "inst-394",
    "code": "630",
    "name": "Nakuru Town East Technical and Vocational College",
    "shortName": "Nakuru Town East TVC",
    "type": "Technical College",
    "county": "Nakuru",
    "town": "Nakuru Town East"
  },
  {
    "id": "inst-395",
    "code": "631",
    "name": "Kilgoris Technical and Vocational College",
    "shortName": "Kilgoris TVC",
    "type": "Technical College",
    "county": "Narok",
    "town": "Kilgoris"
  },
  {
    "id": "inst-396",
    "code": "632",
    "name": "Emurua Dikirr Technical and Vocational College",
    "shortName": "Emurua Dikirr TVC",
    "type": "Technical College",
    "county": "Narok",
    "town": "Emurua Dikirr"
  },
  {
    "id": "inst-397",
    "code": "633",
    "name": "Narok North Technical and Vocational College",
    "shortName": "Narok North TVC",
    "type": "Technical College",
    "county": "Narok",
    "town": "Narok North"
  },
  {
    "id": "inst-398",
    "code": "634",
    "name": "Narok East Technical and Vocational College",
    "shortName": "Narok East TVC",
    "type": "Technical College",
    "county": "Narok",
    "town": "Narok East"
  },
  {
    "id": "inst-399",
    "code": "635",
    "name": "Narok South Technical and Vocational College",
    "shortName": "Narok South TVC",
    "type": "Technical College",
    "county": "Narok",
    "town": "Narok South"
  },
  {
    "id": "inst-400",
    "code": "636",
    "name": "Narok West Technical and Vocational College",
    "shortName": "Narok West TVC",
    "type": "Technical College",
    "county": "Narok",
    "town": "Narok West"
  },
  {
    "id": "inst-401",
    "code": "637",
    "name": "Sogoo Technical and Vocational College",
    "shortName": "Sogoo TVC",
    "type": "Technical College",
    "county": "Narok",
    "town": "Sogoo"
  },
  {
    "id": "inst-402",
    "code": "638",
    "name": "Kajiado North Technical and Vocational College",
    "shortName": "Kajiado North TVC",
    "type": "Technical College",
    "county": "Kajiado",
    "town": "Kajiado North"
  },
  {
    "id": "inst-403",
    "code": "639",
    "name": "Kajiado Central Technical and Vocational College",
    "shortName": "Kajiado Central TVC",
    "type": "Technical College",
    "county": "Kajiado",
    "town": "Kajiado Central"
  },
  {
    "id": "inst-404",
    "code": "640",
    "name": "Kajiado East Technical and Vocational College",
    "shortName": "Kajiado East TVC",
    "type": "Technical College",
    "county": "Kajiado",
    "town": "Kajiado East"
  },
  {
    "id": "inst-405",
    "code": "641",
    "name": "Kajiado West Technical and Vocational College",
    "shortName": "Kajiado West TVC",
    "type": "Technical College",
    "county": "Kajiado",
    "town": "Kajiado West"
  },
  {
    "id": "inst-406",
    "code": "642",
    "name": "Kajiado South Technical and Vocational College",
    "shortName": "Kajiado South TVC",
    "type": "Technical College",
    "county": "Kajiado",
    "town": "Kajiado South"
  },
  {
    "id": "inst-407",
    "code": "643",
    "name": "Ngong Technical and Vocational College",
    "shortName": "Ngong TVC",
    "type": "Technical College",
    "county": "Kajiado",
    "town": "Ngong"
  },
  {
    "id": "inst-408",
    "code": "644",
    "name": "Kitengela Technical and Vocational College",
    "shortName": "Kitengela TVC",
    "type": "Technical College",
    "county": "Kajiado",
    "town": "Kitengela"
  },
  {
    "id": "inst-409",
    "code": "645",
    "name": "Kipkelion East Technical and Vocational College",
    "shortName": "Kipkelion East TVC",
    "type": "Technical College",
    "county": "Kericho",
    "town": "Kipkelion East"
  },
  {
    "id": "inst-410",
    "code": "646",
    "name": "Kipkelion West Technical and Vocational College",
    "shortName": "Kipkelion West TVC",
    "type": "Technical College",
    "county": "Kericho",
    "town": "Kipkelion West"
  },
  {
    "id": "inst-411",
    "code": "647",
    "name": "Ainamoi Technical and Vocational College",
    "shortName": "Ainamoi TVC",
    "type": "Technical College",
    "county": "Kericho",
    "town": "Ainamoi"
  },
  {
    "id": "inst-412",
    "code": "648",
    "name": "Bureti Technical and Vocational College",
    "shortName": "Bureti TVC",
    "type": "Technical College",
    "county": "Kericho",
    "town": "Bureti"
  },
  {
    "id": "inst-413",
    "code": "649",
    "name": "Belgut Technical and Vocational College",
    "shortName": "Belgut TVC",
    "type": "Technical College",
    "county": "Kericho",
    "town": "Belgut"
  },
  {
    "id": "inst-414",
    "code": "650",
    "name": "Soin Sigowet Technical and Vocational College",
    "shortName": "Soin Sigowet TVC",
    "type": "Technical College",
    "county": "Kericho",
    "town": "Soin Sigowet"
  },
  {
    "id": "inst-415",
    "code": "651",
    "name": "Londiani Technical and Vocational College",
    "shortName": "Londiani TVC",
    "type": "Technical College",
    "county": "Kericho",
    "town": "Londiani"
  },
  {
    "id": "inst-416",
    "code": "652",
    "name": "Sotik Technical and Vocational College",
    "shortName": "Sotik TVC",
    "type": "Technical College",
    "county": "Bomet",
    "town": "Sotik"
  },
  {
    "id": "inst-417",
    "code": "653",
    "name": "Chepalungu Technical and Vocational College",
    "shortName": "Chepalungu TVC",
    "type": "Technical College",
    "county": "Bomet",
    "town": "Chepalungu"
  },
  {
    "id": "inst-418",
    "code": "654",
    "name": "Bomet East Technical and Vocational College",
    "shortName": "Bomet East TVC",
    "type": "Technical College",
    "county": "Bomet",
    "town": "Bomet East"
  },
  {
    "id": "inst-419",
    "code": "655",
    "name": "Bomet Central Technical and Vocational College",
    "shortName": "Bomet Central TVC",
    "type": "Technical College",
    "county": "Bomet",
    "town": "Bomet Central"
  },
  {
    "id": "inst-420",
    "code": "656",
    "name": "Konoin Technical and Vocational College",
    "shortName": "Konoin TVC",
    "type": "Technical College",
    "county": "Bomet",
    "town": "Konoin"
  },
  {
    "id": "inst-421",
    "code": "657",
    "name": "Sigor-Bomet Technical and Vocational College",
    "shortName": "Sigor-Bomet TVC",
    "type": "Technical College",
    "county": "Bomet",
    "town": "Sigor Bomet"
  },
  {
    "id": "inst-422",
    "code": "658",
    "name": "Mogogosiek Technical and Vocational College",
    "shortName": "Mogogosiek TVC",
    "type": "Technical College",
    "county": "Bomet",
    "town": "Mogogosiek"
  },
  {
    "id": "inst-423",
    "code": "659",
    "name": "Lugari Technical and Vocational College",
    "shortName": "Lugari TVC",
    "type": "Technical College",
    "county": "Kakamega",
    "town": "Lugari"
  },
  {
    "id": "inst-424",
    "code": "660",
    "name": "Likuyani Technical and Vocational College",
    "shortName": "Likuyani TVC",
    "type": "Technical College",
    "county": "Kakamega",
    "town": "Likuyani"
  },
  {
    "id": "inst-425",
    "code": "661",
    "name": "Malava Technical and Vocational College",
    "shortName": "Malava TVC",
    "type": "Technical College",
    "county": "Kakamega",
    "town": "Malava"
  },
  {
    "id": "inst-426",
    "code": "662",
    "name": "Lurambi Technical and Vocational College",
    "shortName": "Lurambi TVC",
    "type": "Technical College",
    "county": "Kakamega",
    "town": "Lurambi"
  },
  {
    "id": "inst-427",
    "code": "663",
    "name": "Navakholo Technical and Vocational College",
    "shortName": "Navakholo TVC",
    "type": "Technical College",
    "county": "Kakamega",
    "town": "Navakholo"
  },
  {
    "id": "inst-428",
    "code": "664",
    "name": "Mumias West Technical and Vocational College",
    "shortName": "Mumias West TVC",
    "type": "Technical College",
    "county": "Kakamega",
    "town": "Mumias West"
  },
  {
    "id": "inst-429",
    "code": "665",
    "name": "Mumias East Technical and Vocational College",
    "shortName": "Mumias East TVC",
    "type": "Technical College",
    "county": "Kakamega",
    "town": "Mumias East"
  },
  {
    "id": "inst-430",
    "code": "666",
    "name": "Matungu Technical and Vocational College",
    "shortName": "Matungu TVC",
    "type": "Technical College",
    "county": "Kakamega",
    "town": "Matungu"
  },
  {
    "id": "inst-431",
    "code": "667",
    "name": "Butere Technical and Vocational College",
    "shortName": "Butere TVC",
    "type": "Technical College",
    "county": "Kakamega",
    "town": "Butere"
  },
  {
    "id": "inst-432",
    "code": "668",
    "name": "Khwisero Technical and Vocational College",
    "shortName": "Khwisero TVC",
    "type": "Technical College",
    "county": "Kakamega",
    "town": "Khwisero"
  },
  {
    "id": "inst-433",
    "code": "669",
    "name": "Shinyalu Technical and Vocational College",
    "shortName": "Shinyalu TVC",
    "type": "Technical College",
    "county": "Kakamega",
    "town": "Shinyalu"
  },
  {
    "id": "inst-434",
    "code": "670",
    "name": "Ikolomani Technical and Vocational College",
    "shortName": "Ikolomani TVC",
    "type": "Technical College",
    "county": "Kakamega",
    "town": "Ikolomani"
  },
  {
    "id": "inst-435",
    "code": "671",
    "name": "Vihiga Technical and Vocational College",
    "shortName": "Vihiga TVC",
    "type": "Technical College",
    "county": "Vihiga",
    "town": "Vihiga"
  },
  {
    "id": "inst-436",
    "code": "672",
    "name": "Sabatia Technical and Vocational College",
    "shortName": "Sabatia TVC",
    "type": "Technical College",
    "county": "Vihiga",
    "town": "Sabatia"
  },
  {
    "id": "inst-437",
    "code": "673",
    "name": "Hamisi Technical and Vocational College",
    "shortName": "Hamisi TVC",
    "type": "Technical College",
    "county": "Vihiga",
    "town": "Hamisi"
  },
  {
    "id": "inst-438",
    "code": "674",
    "name": "Luanda Technical and Vocational College",
    "shortName": "Luanda TVC",
    "type": "Technical College",
    "county": "Vihiga",
    "town": "Luanda"
  },
  {
    "id": "inst-439",
    "code": "675",
    "name": "Emuhaya Technical and Vocational College",
    "shortName": "Emuhaya TVC",
    "type": "Technical College",
    "county": "Vihiga",
    "town": "Emuhaya"
  },
  {
    "id": "inst-440",
    "code": "676",
    "name": "Chavakali Technical and Vocational College",
    "shortName": "Chavakali TVC",
    "type": "Technical College",
    "county": "Vihiga",
    "town": "Chavakali"
  },
  {
    "id": "inst-441",
    "code": "677",
    "name": "Mount Elgon Technical and Vocational College",
    "shortName": "Mount Elgon TVC",
    "type": "Technical College",
    "county": "Bungoma",
    "town": "Mount Elgon"
  },
  {
    "id": "inst-442",
    "code": "678",
    "name": "Sirisia Technical and Vocational College",
    "shortName": "Sirisia TVC",
    "type": "Technical College",
    "county": "Bungoma",
    "town": "Sirisia"
  },
  {
    "id": "inst-443",
    "code": "679",
    "name": "Kabuchai Technical and Vocational College",
    "shortName": "Kabuchai TVC",
    "type": "Technical College",
    "county": "Bungoma",
    "town": "Kabuchai"
  },
  {
    "id": "inst-444",
    "code": "680",
    "name": "Bumula Technical and Vocational College",
    "shortName": "Bumula TVC",
    "type": "Technical College",
    "county": "Bungoma",
    "town": "Bumula"
  },
  {
    "id": "inst-445",
    "code": "681",
    "name": "Kanduyi Technical and Vocational College",
    "shortName": "Kanduyi TVC",
    "type": "Technical College",
    "county": "Bungoma",
    "town": "Kanduyi"
  },
  {
    "id": "inst-446",
    "code": "682",
    "name": "Webuye East Technical and Vocational College",
    "shortName": "Webuye East TVC",
    "type": "Technical College",
    "county": "Bungoma",
    "town": "Webuye East"
  },
  {
    "id": "inst-447",
    "code": "683",
    "name": "Webuye West Technical and Vocational College",
    "shortName": "Webuye West TVC",
    "type": "Technical College",
    "county": "Bungoma",
    "town": "Webuye West"
  },
  {
    "id": "inst-448",
    "code": "684",
    "name": "Kimilili Technical and Vocational College",
    "shortName": "Kimilili TVC",
    "type": "Technical College",
    "county": "Bungoma",
    "town": "Kimilili"
  },
  {
    "id": "inst-449",
    "code": "685",
    "name": "Tongaren Technical and Vocational College",
    "shortName": "Tongaren TVC",
    "type": "Technical College",
    "county": "Bungoma",
    "town": "Tongaren"
  },
  {
    "id": "inst-450",
    "code": "686",
    "name": "Chwele Technical and Vocational College",
    "shortName": "Chwele TVC",
    "type": "Technical College",
    "county": "Bungoma",
    "town": "Chwele"
  },
  {
    "id": "inst-451",
    "code": "687",
    "name": "Teso North Technical and Vocational College",
    "shortName": "Teso North TVC",
    "type": "Technical College",
    "county": "Busia",
    "town": "Teso North"
  },
  {
    "id": "inst-452",
    "code": "688",
    "name": "Teso South Technical and Vocational College",
    "shortName": "Teso South TVC",
    "type": "Technical College",
    "county": "Busia",
    "town": "Teso South"
  },
  {
    "id": "inst-453",
    "code": "689",
    "name": "Nambale Technical and Vocational College",
    "shortName": "Nambale TVC",
    "type": "Technical College",
    "county": "Busia",
    "town": "Nambale"
  },
  {
    "id": "inst-454",
    "code": "690",
    "name": "Matayos Technical and Vocational College",
    "shortName": "Matayos TVC",
    "type": "Technical College",
    "county": "Busia",
    "town": "Matayos"
  },
  {
    "id": "inst-455",
    "code": "691",
    "name": "Butula Technical and Vocational College",
    "shortName": "Butula TVC",
    "type": "Technical College",
    "county": "Busia",
    "town": "Butula"
  },
  {
    "id": "inst-456",
    "code": "692",
    "name": "Funyula Technical and Vocational College",
    "shortName": "Funyula TVC",
    "type": "Technical College",
    "county": "Busia",
    "town": "Funyula"
  },
  {
    "id": "inst-457",
    "code": "693",
    "name": "Budalangi Technical and Vocational College",
    "shortName": "Budalangi TVC",
    "type": "Technical College",
    "county": "Busia",
    "town": "Budalangi"
  },
  {
    "id": "inst-458",
    "code": "694",
    "name": "Malaba Technical and Vocational College",
    "shortName": "Malaba TVC",
    "type": "Technical College",
    "county": "Busia",
    "town": "Malaba"
  },
  {
    "id": "inst-459",
    "code": "695",
    "name": "Ugenya Technical and Vocational College",
    "shortName": "Ugenya TVC",
    "type": "Technical College",
    "county": "Siaya",
    "town": "Ugenya"
  },
  {
    "id": "inst-460",
    "code": "696",
    "name": "Ugunja Technical and Vocational College",
    "shortName": "Ugunja TVC",
    "type": "Technical College",
    "county": "Siaya",
    "town": "Ugunja"
  },
  {
    "id": "inst-461",
    "code": "697",
    "name": "Alego Usonga Technical and Vocational College",
    "shortName": "Alego Usonga TVC",
    "type": "Technical College",
    "county": "Siaya",
    "town": "Alego Usonga"
  },
  {
    "id": "inst-462",
    "code": "698",
    "name": "Gem Technical and Vocational College",
    "shortName": "Gem TVC",
    "type": "Technical College",
    "county": "Siaya",
    "town": "Gem"
  },
  {
    "id": "inst-463",
    "code": "699",
    "name": "Bondo Technical and Vocational College",
    "shortName": "Bondo TVC",
    "type": "Technical College",
    "county": "Siaya",
    "town": "Bondo"
  },
  {
    "id": "inst-464",
    "code": "700",
    "name": "Rarieda Technical and Vocational College",
    "shortName": "Rarieda TVC",
    "type": "Technical College",
    "county": "Siaya",
    "town": "Rarieda"
  },
  {
    "id": "inst-465",
    "code": "701",
    "name": "Yala Technical and Vocational College",
    "shortName": "Yala TVC",
    "type": "Technical College",
    "county": "Siaya",
    "town": "Yala"
  },
  {
    "id": "inst-466",
    "code": "702",
    "name": "Kisumu East Technical and Vocational College",
    "shortName": "Kisumu East TVC",
    "type": "Technical College",
    "county": "Kisumu",
    "town": "Kisumu East"
  },
  {
    "id": "inst-467",
    "code": "703",
    "name": "Kisumu West Technical and Vocational College",
    "shortName": "Kisumu West TVC",
    "type": "Technical College",
    "county": "Kisumu",
    "town": "Kisumu West"
  },
  {
    "id": "inst-468",
    "code": "704",
    "name": "Kisumu Central Technical and Vocational College",
    "shortName": "Kisumu Central TVC",
    "type": "Technical College",
    "county": "Kisumu",
    "town": "Kisumu Central"
  },
  {
    "id": "inst-469",
    "code": "705",
    "name": "Seme Technical and Vocational College",
    "shortName": "Seme TVC",
    "type": "Technical College",
    "county": "Kisumu",
    "town": "Seme"
  },
  {
    "id": "inst-470",
    "code": "706",
    "name": "Nyando Technical and Vocational College",
    "shortName": "Nyando TVC",
    "type": "Technical College",
    "county": "Kisumu",
    "town": "Nyando"
  },
  {
    "id": "inst-471",
    "code": "707",
    "name": "Muhoroni Technical and Vocational College",
    "shortName": "Muhoroni TVC",
    "type": "Technical College",
    "county": "Kisumu",
    "town": "Muhoroni"
  },
  {
    "id": "inst-472",
    "code": "708",
    "name": "Nyakach Technical and Vocational College",
    "shortName": "Nyakach TVC",
    "type": "Technical College",
    "county": "Kisumu",
    "town": "Nyakach"
  },
  {
    "id": "inst-473",
    "code": "709",
    "name": "Ahero Technical and Vocational College",
    "shortName": "Ahero TVC",
    "type": "Technical College",
    "county": "Kisumu",
    "town": "Ahero"
  },
  {
    "id": "inst-474",
    "code": "710",
    "name": "Kasipul Technical and Vocational College",
    "shortName": "Kasipul TVC",
    "type": "Technical College",
    "county": "Homa Bay",
    "town": "Kasipul"
  },
  {
    "id": "inst-475",
    "code": "711",
    "name": "Kabondo Kasipul Technical and Vocational College",
    "shortName": "Kabondo Kasipul TVC",
    "type": "Technical College",
    "county": "Homa Bay",
    "town": "Kabondo Kasipul"
  },
  {
    "id": "inst-476",
    "code": "712",
    "name": "Karachuonyo Technical and Vocational College",
    "shortName": "Karachuonyo TVC",
    "type": "Technical College",
    "county": "Homa Bay",
    "town": "Karachuonyo"
  },
  {
    "id": "inst-477",
    "code": "713",
    "name": "Rangwe Technical and Vocational College",
    "shortName": "Rangwe TVC",
    "type": "Technical College",
    "county": "Homa Bay",
    "town": "Rangwe"
  },
  {
    "id": "inst-478",
    "code": "714",
    "name": "Homa Bay Town Technical and Vocational College",
    "shortName": "Homa Bay Town TVC",
    "type": "Technical College",
    "county": "Homa Bay",
    "town": "Homa Bay Town"
  },
  {
    "id": "inst-479",
    "code": "715",
    "name": "Ndhiwa Technical and Vocational College",
    "shortName": "Ndhiwa TVC",
    "type": "Technical College",
    "county": "Homa Bay",
    "town": "Ndhiwa"
  },
  {
    "id": "inst-480",
    "code": "716",
    "name": "Suba North Technical and Vocational College",
    "shortName": "Suba North TVC",
    "type": "Technical College",
    "county": "Homa Bay",
    "town": "Suba North"
  },
  {
    "id": "inst-481",
    "code": "717",
    "name": "Suba South Technical and Vocational College",
    "shortName": "Suba South TVC",
    "type": "Technical College",
    "county": "Homa Bay",
    "town": "Suba South"
  },
  {
    "id": "inst-482",
    "code": "718",
    "name": "Rongo Technical and Vocational College",
    "shortName": "Rongo TVC",
    "type": "Technical College",
    "county": "Migori",
    "town": "Rongo"
  },
  {
    "id": "inst-483",
    "code": "719",
    "name": "Awendo Technical and Vocational College",
    "shortName": "Awendo TVC",
    "type": "Technical College",
    "county": "Migori",
    "town": "Awendo"
  },
  {
    "id": "inst-484",
    "code": "720",
    "name": "Suna East Technical and Vocational College",
    "shortName": "Suna East TVC",
    "type": "Technical College",
    "county": "Migori",
    "town": "Suna East"
  },
  {
    "id": "inst-485",
    "code": "721",
    "name": "Suna West Technical and Vocational College",
    "shortName": "Suna West TVC",
    "type": "Technical College",
    "county": "Migori",
    "town": "Suna West"
  },
  {
    "id": "inst-486",
    "code": "722",
    "name": "Uriri Technical and Vocational College",
    "shortName": "Uriri TVC",
    "type": "Technical College",
    "county": "Migori",
    "town": "Uriri"
  },
  {
    "id": "inst-487",
    "code": "723",
    "name": "Nyatike Technical and Vocational College",
    "shortName": "Nyatike TVC",
    "type": "Technical College",
    "county": "Migori",
    "town": "Nyatike"
  },
  {
    "id": "inst-488",
    "code": "724",
    "name": "Kuria West Technical and Vocational College",
    "shortName": "Kuria West TVC",
    "type": "Technical College",
    "county": "Migori",
    "town": "Kuria West"
  },
  {
    "id": "inst-489",
    "code": "725",
    "name": "Kuria East Technical and Vocational College",
    "shortName": "Kuria East TVC",
    "type": "Technical College",
    "county": "Migori",
    "town": "Kuria East"
  },
  {
    "id": "inst-490",
    "code": "726",
    "name": "Kehancha Technical and Vocational College",
    "shortName": "Kehancha TVC",
    "type": "Technical College",
    "county": "Migori",
    "town": "Kehancha"
  },
  {
    "id": "inst-491",
    "code": "727",
    "name": "Bonchari Technical and Vocational College",
    "shortName": "Bonchari TVC",
    "type": "Technical College",
    "county": "Kisii",
    "town": "Bonchari"
  },
  {
    "id": "inst-492",
    "code": "728",
    "name": "South Mugirango Technical and Vocational College",
    "shortName": "South Mugirango TVC",
    "type": "Technical College",
    "county": "Kisii",
    "town": "South Mugirango"
  },
  {
    "id": "inst-493",
    "code": "729",
    "name": "Bomachoge Borabu Technical and Vocational College",
    "shortName": "Bomachoge Borabu TVC",
    "type": "Technical College",
    "county": "Kisii",
    "town": "Bomachoge Borabu"
  },
  {
    "id": "inst-494",
    "code": "730",
    "name": "Bobasi Technical and Vocational College",
    "shortName": "Bobasi TVC",
    "type": "Technical College",
    "county": "Kisii",
    "town": "Bobasi"
  },
  {
    "id": "inst-495",
    "code": "731",
    "name": "Bomachoge Chache Technical and Vocational College",
    "shortName": "Bomachoge Chache TVC",
    "type": "Technical College",
    "county": "Kisii",
    "town": "Bomachoge Chache"
  },
  {
    "id": "inst-496",
    "code": "732",
    "name": "Nyaribari Masaba Technical and Vocational College",
    "shortName": "Nyaribari Masaba TVC",
    "type": "Technical College",
    "county": "Kisii",
    "town": "Nyaribari Masaba"
  },
  {
    "id": "inst-497",
    "code": "733",
    "name": "Nyaribari Chache Technical and Vocational College",
    "shortName": "Nyaribari Chache TVC",
    "type": "Technical College",
    "county": "Kisii",
    "town": "Nyaribari Chache"
  },
  {
    "id": "inst-498",
    "code": "734",
    "name": "Kitutu Chache North Technical and Vocational College",
    "shortName": "Kitutu Chache North TVC",
    "type": "Technical College",
    "county": "Kisii",
    "town": "Kitutu Chache North"
  },
  {
    "id": "inst-499",
    "code": "735",
    "name": "Kitutu Chache South Technical and Vocational College",
    "shortName": "Kitutu Chache South TVC",
    "type": "Technical College",
    "county": "Kisii",
    "town": "Kitutu Chache South"
  },
  {
    "id": "inst-500",
    "code": "736",
    "name": "Ogembo Technical and Vocational College",
    "shortName": "Ogembo TVC",
    "type": "Technical College",
    "county": "Kisii",
    "town": "Ogembo"
  },
  {
    "id": "inst-501",
    "code": "737",
    "name": "Kitutu Masaba Technical and Vocational College",
    "shortName": "Kitutu Masaba TVC",
    "type": "Technical College",
    "county": "Nyamira",
    "town": "Kitutu Masaba"
  },
  {
    "id": "inst-502",
    "code": "738",
    "name": "West Mugirango Technical and Vocational College",
    "shortName": "West Mugirango TVC",
    "type": "Technical College",
    "county": "Nyamira",
    "town": "West Mugirango"
  },
  {
    "id": "inst-503",
    "code": "739",
    "name": "North Mugirango Technical and Vocational College",
    "shortName": "North Mugirango TVC",
    "type": "Technical College",
    "county": "Nyamira",
    "town": "North Mugirango"
  },
  {
    "id": "inst-504",
    "code": "740",
    "name": "Borabu Technical and Vocational College",
    "shortName": "Borabu TVC",
    "type": "Technical College",
    "county": "Nyamira",
    "town": "Borabu"
  },
  {
    "id": "inst-505",
    "code": "741",
    "name": "Manga Technical and Vocational College",
    "shortName": "Manga TVC",
    "type": "Technical College",
    "county": "Nyamira",
    "town": "Manga"
  },
  {
    "id": "inst-506",
    "code": "742",
    "name": "Nyansiongo Technical and Vocational College",
    "shortName": "Nyansiongo TVC",
    "type": "Technical College",
    "county": "Nyamira",
    "town": "Nyansiongo"
  },
  {
    "id": "inst-507",
    "code": "743",
    "name": "Donholm Technical and Vocational College",
    "shortName": "Donholm TVC",
    "type": "Technical College",
    "county": "Nairobi",
    "town": "Donholm"
  },
  {
    "id": "inst-508",
    "code": "744",
    "name": "Banana Technical and Vocational College",
    "shortName": "Banana TVC",
    "type": "Technical College",
    "county": "Kiambu",
    "town": "Banana"
  },
  {
    "id": "inst-509",
    "code": "745",
    "name": "Mau Narok Technical and Vocational College",
    "shortName": "Mau Narok TVC",
    "type": "Technical College",
    "county": "Nakuru",
    "town": "Mau Narok"
  },
  {
    "id": "inst-510",
    "code": "746",
    "name": "Hawkins Technical and Vocational College",
    "shortName": "Hawkins TVC",
    "type": "Technical College",
    "county": "Uasin Gishu",
    "town": "Hawkins"
  },
  {
    "id": "inst-511",
    "code": "747",
    "name": "Koma Technical and Vocational College",
    "shortName": "Koma TVC",
    "type": "Technical College",
    "county": "Machakos",
    "town": "Koma"
  },
  {
    "id": "inst-512",
    "code": "748",
    "name": "Musoli Technical and Vocational College",
    "shortName": "Musoli TVC",
    "type": "Technical College",
    "county": "Kakamega",
    "town": "Musoli"
  },
  {
    "id": "inst-513",
    "code": "749",
    "name": "Malakisi Technical and Vocational College",
    "shortName": "Malakisi TVC",
    "type": "Technical College",
    "county": "Bungoma",
    "town": "Malakisi"
  },
  {
    "id": "inst-514",
    "code": "750",
    "name": "Otonglo Technical and Vocational College",
    "shortName": "Otonglo TVC",
    "type": "Technical College",
    "county": "Kisumu",
    "town": "Otonglo"
  }
];

// src/data/additionalProgrammes.ts
var ADDITIONAL_PROGRAMMES = [
  // =========================================================================
  // HEALTH SCIENCES & SPECIALIZED MEDICINE (Cluster 9)
  // =========================================================================
  {
    id: "prog-physiotherapy-deg",
    code: "1111905",
    name: "Bachelor of Science in Physiotherapy",
    level: "Degree",
    category: "Health Sciences",
    clusterNumber: 9,
    clusterGroupName: "KUCCPS Cluster 9: Medicine, Pharmacy, Nursing & Health Sciences",
    minimumMeanGrade: "C+",
    clusterSubjects: ["Biology", "Physics", "Mathematics or Chemistry", "English or Kiswahili"],
    subjectRequirements: [
      { subject: "Biology", minGrade: "C+" },
      { subject: "Physics", minGrade: "C+" },
      { subject: "Mathematics", minGrade: "C+", alternativeSubjects: ["Chemistry"] },
      { subject: "English", minGrade: "C+", alternativeSubjects: ["Kiswahili"] }
    ],
    historicalCutoffs: { "2023/2024": 36.8, "2024/2025": 37.5 },
    institutions: [
      { institutionId: "inst-3", institutionCode: "113", institutionName: "Jomo Kenyatta University of Agriculture and Technology", county: "Kiambu", type: "Public University", historicalCutoffs: { "2023/2024": 37.9, "2024/2025": 38.6 } },
      { institutionId: "inst-4", institutionCode: "114", institutionName: "Moi University", county: "Uasin Gishu", type: "Public University", historicalCutoffs: { "2023/2024": 36.2, "2024/2025": 36.9 } },
      { institutionId: "inst-2", institutionCode: "112", institutionName: "Kenyatta University", county: "Kiambu", type: "Public University", historicalCutoffs: { "2023/2024": 36.5, "2024/2025": 37.2 } }
    ],
    active: true,
    notes: "Physiotherapy Council of Kenya recognized. Rehabilitation, sports injuries, and neuro-musculoskeletal therapy."
  },
  {
    id: "prog-occupational-therapy-deg",
    code: "1111908",
    name: "Bachelor of Science in Occupational Therapy",
    level: "Degree",
    category: "Health Sciences",
    clusterNumber: 9,
    clusterGroupName: "KUCCPS Cluster 9: Medicine, Pharmacy, Nursing & Health Sciences",
    minimumMeanGrade: "C+",
    clusterSubjects: ["Biology", "Chemistry or Physics", "Mathematics or Home Science", "English or Kiswahili"],
    subjectRequirements: [
      { subject: "Biology", minGrade: "C+" },
      { subject: "Physics", minGrade: "C", alternativeSubjects: ["Chemistry"] },
      { subject: "English", minGrade: "C+", alternativeSubjects: ["Kiswahili"] }
    ],
    historicalCutoffs: { "2023/2024": 34.5, "2024/2025": 35.2 },
    institutions: [
      { institutionId: "inst-3", institutionCode: "113", institutionName: "Jomo Kenyatta University of Agriculture and Technology", county: "Kiambu", type: "Public University", historicalCutoffs: { "2023/2024": 35.8, "2024/2025": 36.5 } },
      { institutionId: "inst-2", institutionCode: "112", institutionName: "Kenyatta University", county: "Kiambu", type: "Public University", historicalCutoffs: { "2023/2024": 34.2, "2024/2025": 34.9 } }
    ],
    active: true,
    notes: "Rehabilitation therapy for children with special needs, post-stroke motor recovery, and adaptive physical functioning."
  },
  {
    id: "prog-optometry-deg",
    code: "1111909",
    name: "Bachelor of Science in Optometry and Vision Sciences",
    level: "Degree",
    category: "Health Sciences",
    clusterNumber: 9,
    clusterGroupName: "KUCCPS Cluster 9: Medicine, Pharmacy, Nursing & Health Sciences",
    minimumMeanGrade: "C+",
    clusterSubjects: ["Physics", "Biology", "Mathematics or Chemistry", "English or Kiswahili"],
    subjectRequirements: [
      { subject: "Physics", minGrade: "C+" },
      { subject: "Biology", minGrade: "C+" },
      { subject: "Mathematics", minGrade: "C", alternativeSubjects: ["Chemistry"] },
      { subject: "English", minGrade: "C+", alternativeSubjects: ["Kiswahili"] }
    ],
    historicalCutoffs: { "2023/2024": 34.8, "2024/2025": 35.5 },
    institutions: [
      { institutionId: "inst-11", institutionCode: "121", institutionName: "Masinde Muliro University of Science and Technology", county: "Kakamega", type: "Public University", historicalCutoffs: { "2023/2024": 34.8, "2024/2025": 35.5 } }
    ],
    active: true,
    notes: "Primary eye care, ophthalmic optics, refraction correction, contact lens prescription, and low vision rehabilitation."
  },
  {
    id: "prog-envhealth-deg",
    code: "1111910",
    name: "Bachelor of Science in Environmental Health",
    level: "Degree",
    category: "Health Sciences",
    clusterNumber: 9,
    clusterGroupName: "KUCCPS Cluster 9: Medicine, Pharmacy, Nursing & Health Sciences",
    minimumMeanGrade: "C+",
    clusterSubjects: ["Biology", "Chemistry", "Mathematics or Physics", "English or Kiswahili"],
    subjectRequirements: [
      { subject: "Biology", minGrade: "C+" },
      { subject: "Chemistry", minGrade: "C+" },
      { subject: "Mathematics", minGrade: "C", alternativeSubjects: ["Physics"] },
      { subject: "English", minGrade: "C", alternativeSubjects: ["Kiswahili"] }
    ],
    historicalCutoffs: { "2023/2024": 32.8, "2024/2025": 33.5 },
    institutions: [
      { institutionId: "inst-2", institutionCode: "112", institutionName: "Kenyatta University", county: "Kiambu", type: "Public University", historicalCutoffs: { "2023/2024": 34.5, "2024/2025": 35.2 } },
      { institutionId: "inst-4", institutionCode: "114", institutionName: "Moi University", county: "Uasin Gishu", type: "Public University", historicalCutoffs: { "2023/2024": 32.1, "2024/2025": 32.8 } }
    ],
    active: true,
    notes: "Public Health Officers and Technicians Council (PHOTO) accredited sanitation, port health inspection, and disease vector control."
  },
  // =========================================================================
  // ENGINEERING & TECHNOLOGY (Cluster 5 & 15)
  // =========================================================================
  {
    id: "prog-biomed-eng-deg",
    code: "1111501",
    name: "Bachelor of Science in Biomedical Engineering",
    level: "Degree",
    category: "Engineering",
    clusterNumber: 5,
    clusterGroupName: "KUCCPS Cluster 5: Engineering & Technology",
    minimumMeanGrade: "C+",
    clusterSubjects: ["Mathematics", "Physics", "Chemistry", "Biology or Any Group III/IV/V"],
    subjectRequirements: [
      { subject: "Mathematics", minGrade: "C+" },
      { subject: "Physics", minGrade: "C+" },
      { subject: "Chemistry", minGrade: "C+" },
      { subject: "Biology", minGrade: "C", alternativeSubjects: ["Computer Studies"] }
    ],
    historicalCutoffs: { "2023/2024": 37.2, "2024/2025": 37.9 },
    institutions: [
      { institutionId: "inst-2", institutionCode: "112", institutionName: "Kenyatta University", county: "Kiambu", type: "Public University", historicalCutoffs: { "2023/2024": 38.1, "2024/2025": 38.8 } },
      { institutionId: "inst-5", institutionCode: "115", institutionName: "Egerton University", county: "Nakuru", type: "Public University", historicalCutoffs: { "2023/2024": 35.8, "2024/2025": 36.5 } }
    ],
    active: true,
    notes: "Blends engineering with medical device design, hospital electronics, ICU equipment, and biomaterials."
  },
  {
    id: "prog-marine-eng-deg",
    code: "1111502",
    name: "Bachelor of Science in Marine Engineering",
    level: "Degree",
    category: "Engineering",
    clusterNumber: 15,
    clusterGroupName: "KUCCPS Cluster 15: Maritime Transport, Logistics & Shipping",
    minimumMeanGrade: "C+",
    clusterSubjects: ["Mathematics", "Physics", "Chemistry", "English or Kiswahili"],
    subjectRequirements: [
      { subject: "Mathematics", minGrade: "C+" },
      { subject: "Physics", minGrade: "C+" },
      { subject: "Chemistry", minGrade: "C+" },
      { subject: "English", minGrade: "C", alternativeSubjects: ["Kiswahili"] }
    ],
    historicalCutoffs: { "2023/2024": 38.8, "2024/2025": 39.5 },
    institutions: [
      { institutionId: "inst-3", institutionCode: "113", institutionName: "Jomo Kenyatta University of Agriculture and Technology", county: "Kiambu", type: "Public University", historicalCutoffs: { "2023/2024": 40.2, "2024/2025": 40.9 } },
      { institutionId: "inst-13", institutionCode: "123", institutionName: "Technical University of Mombasa", county: "Mombasa", type: "Public University", historicalCutoffs: { "2023/2024": 37.5, "2024/2025": 38.2 } }
    ],
    active: true,
    notes: "IMO STCW certified ship propulsion systems, maritime navigation, naval architecture, and port operations."
  },
  {
    id: "prog-mining-eng-deg",
    code: "1111503",
    name: "Bachelor of Science in Mining & Mineral Processing Engineering",
    level: "Degree",
    category: "Engineering",
    clusterNumber: 5,
    clusterGroupName: "KUCCPS Cluster 5: Engineering & Technology",
    minimumMeanGrade: "C+",
    clusterSubjects: ["Mathematics", "Physics", "Chemistry", "Geography or Any Science"],
    subjectRequirements: [
      { subject: "Mathematics", minGrade: "C+" },
      { subject: "Physics", minGrade: "C+" },
      { subject: "Chemistry", minGrade: "C+" }
    ],
    historicalCutoffs: { "2023/2024": 35.4, "2024/2025": 36.1 },
    institutions: [
      { institutionId: "inst-22", institutionCode: "131", institutionName: "Taita Taveta University", county: "Taita Taveta", type: "Public University", historicalCutoffs: { "2023/2024": 34.2, "2024/2025": 34.9 } },
      { institutionId: "inst-3", institutionCode: "113", institutionName: "Jomo Kenyatta University of Agriculture and Technology", county: "Kiambu", type: "Public University", historicalCutoffs: { "2023/2024": 37.1, "2024/2025": 37.8 } },
      { institutionId: "inst-6", institutionCode: "116", institutionName: "Technical University of Kenya", county: "Nairobi", type: "Public University", historicalCutoffs: { "2023/2024": 35.5, "2024/2025": 36.2 } }
    ],
    active: true,
    notes: "Exploration, mineral extraction, metallurgy, safety, and sustainable resource processing."
  },
  {
    id: "prog-petroleum-eng-deg",
    code: "1111505",
    name: "Bachelor of Science in Petroleum Engineering",
    level: "Degree",
    category: "Engineering",
    clusterNumber: 5,
    clusterGroupName: "KUCCPS Cluster 5: Engineering & Technology",
    minimumMeanGrade: "C+",
    clusterSubjects: ["Mathematics", "Physics", "Chemistry", "Geography or Any Science"],
    subjectRequirements: [
      { subject: "Mathematics", minGrade: "C+" },
      { subject: "Physics", minGrade: "C+" },
      { subject: "Chemistry", minGrade: "C+" }
    ],
    historicalCutoffs: { "2023/2024": 37.8, "2024/2025": 38.5 },
    institutions: [
      { institutionId: "inst-6", institutionCode: "116", institutionName: "Technical University of Kenya", county: "Nairobi", type: "Public University", historicalCutoffs: { "2023/2024": 37.8, "2024/2025": 38.5 } },
      { institutionId: "inst-22", institutionCode: "131", institutionName: "Taita Taveta University", county: "Taita Taveta", type: "Public University", historicalCutoffs: { "2023/2024": 35.2, "2024/2025": 35.9 } }
    ],
    active: true,
    notes: "Drilling engineering, reservoir simulation, petroleum geology, and refinery processing."
  },
  {
    id: "prog-agribiosystems-deg",
    code: "1111506",
    name: "Bachelor of Science in Agricultural and Biosystems Engineering",
    level: "Degree",
    category: "Engineering",
    clusterNumber: 5,
    clusterGroupName: "KUCCPS Cluster 5: Engineering & Technology",
    minimumMeanGrade: "C+",
    clusterSubjects: ["Mathematics", "Physics", "Chemistry", "Biology or Agriculture"],
    subjectRequirements: [
      { subject: "Mathematics", minGrade: "C+" },
      { subject: "Physics", minGrade: "C+" },
      { subject: "Chemistry", minGrade: "C+" },
      { subject: "Biology", minGrade: "C", alternativeSubjects: ["Agriculture"] }
    ],
    historicalCutoffs: { "2023/2024": 34.6, "2024/2025": 35.3 },
    institutions: [
      { institutionId: "inst-3", institutionCode: "113", institutionName: "Jomo Kenyatta University of Agriculture and Technology", county: "Kiambu", type: "Public University", historicalCutoffs: { "2023/2024": 36.4, "2024/2025": 37.1 } },
      { institutionId: "inst-5", institutionCode: "115", institutionName: "Egerton University", county: "Nakuru", type: "Public University", historicalCutoffs: { "2023/2024": 34.1, "2024/2025": 34.8 } }
    ],
    active: true,
    notes: "Irrigation, farm power and machinery, post-harvest processing, and bio-environmental engineering."
  },
  {
    id: "prog-renewable-energy-deg",
    code: "1111507",
    name: "Bachelor of Science in Renewable Energy and Environmental Physics",
    level: "Degree",
    category: "Engineering",
    clusterNumber: 5,
    clusterGroupName: "KUCCPS Cluster 5: Engineering & Technology",
    minimumMeanGrade: "C+",
    clusterSubjects: ["Mathematics", "Physics", "Chemistry", "Geography or Computer Studies"],
    subjectRequirements: [
      { subject: "Mathematics", minGrade: "C+" },
      { subject: "Physics", minGrade: "C+" },
      { subject: "Chemistry", minGrade: "C", alternativeSubjects: ["Computer Studies"] }
    ],
    historicalCutoffs: { "2023/2024": 33.5, "2024/2025": 34.2 },
    institutions: [
      { institutionId: "inst-3", institutionCode: "113", institutionName: "Jomo Kenyatta University of Agriculture and Technology", county: "Kiambu", type: "Public University", historicalCutoffs: { "2023/2024": 35.2, "2024/2025": 35.9 } },
      { institutionId: "inst-5", institutionCode: "115", institutionName: "Egerton University", county: "Nakuru", type: "Public University", historicalCutoffs: { "2023/2024": 33.1, "2024/2025": 33.8 } },
      { institutionId: "inst-16", institutionCode: "126", institutionName: "Meru University of Science and Technology", county: "Meru", type: "Public University", historicalCutoffs: { "2023/2024": 31.5, "2024/2025": 32.2 } }
    ],
    active: true,
    notes: "Solar PV grid systems, wind energy turbine farms, geothermal development, and bioenergy conversion."
  },
  // =========================================================================
  // BUILT ENVIRONMENT & URBAN PLANNING (Cluster 6 & 18)
  // =========================================================================
  {
    id: "prog-urbanplan-deg",
    code: "1111603",
    name: "Bachelor of Urban & Regional Planning",
    level: "Degree",
    category: "Architecture & Design",
    clusterNumber: 6,
    clusterGroupName: "KUCCPS Cluster 6: Architecture, Quantity Surveying & Building Construction",
    minimumMeanGrade: "C+",
    clusterSubjects: ["Geography", "Mathematics", "English or Kiswahili", "Economics or Any Science"],
    subjectRequirements: [
      { subject: "Mathematics", minGrade: "C" },
      { subject: "Geography", minGrade: "C+", alternativeSubjects: ["Economics"] },
      { subject: "English", minGrade: "C+", alternativeSubjects: ["Kiswahili"] }
    ],
    historicalCutoffs: { "2023/2024": 34.2, "2024/2025": 34.9 },
    institutions: [
      { institutionId: "inst-1", institutionCode: "111", institutionName: "University of Nairobi", county: "Nairobi", type: "Public University", historicalCutoffs: { "2023/2024": 36.4, "2024/2025": 37.1 } },
      { institutionId: "inst-7", institutionCode: "117", institutionName: "Maseno University", county: "Kisumu", type: "Public University", historicalCutoffs: { "2023/2024": 33.1, "2024/2025": 33.8 } },
      { institutionId: "inst-13", institutionCode: "123", institutionName: "Technical University of Mombasa", county: "Mombasa", type: "Public University", historicalCutoffs: { "2023/2024": 32.5, "2024/2025": 33.2 } }
    ],
    active: true,
    notes: "Town and country planning, urban transport modeling, masterplan development, and zoning."
  },
  {
    id: "prog-interior-deg",
    code: "1111604",
    name: "Bachelor of Science in Interior Design",
    level: "Degree",
    category: "Architecture & Design",
    clusterNumber: 18,
    clusterGroupName: "KUCCPS Cluster 18: Fashion Design, Clothing & Textiles",
    minimumMeanGrade: "C+",
    clusterSubjects: ["Art & Design or Physics", "Mathematics", "English or Kiswahili", "Any Group III/IV"],
    subjectRequirements: [
      { subject: "Art and Design", minGrade: "C", alternativeSubjects: ["Physics", "Geography", "Home Science"] },
      { subject: "Mathematics", minGrade: "C-" },
      { subject: "English", minGrade: "C", alternativeSubjects: ["Kiswahili"] }
    ],
    historicalCutoffs: { "2023/2024": 31.8, "2024/2025": 32.5 },
    institutions: [
      { institutionId: "inst-2", institutionCode: "112", institutionName: "Kenyatta University", county: "Kiambu", type: "Public University", historicalCutoffs: { "2023/2024": 33.5, "2024/2025": 34.2 } },
      { institutionId: "inst-6", institutionCode: "116", institutionName: "Technical University of Kenya", county: "Nairobi", type: "Public University", historicalCutoffs: { "2023/2024": 31.5, "2024/2025": 32.2 } }
    ],
    active: true,
    notes: "Architectural interiors, spatial layout, lighting acoustics, commercial fit-outs, and ergonomics."
  },
  {
    id: "prog-geoinformatics-deg",
    code: "1111607",
    name: "Bachelor of Science in Geoinformatics and Earth Observation",
    level: "Degree",
    category: "Architecture & Design",
    clusterNumber: 6,
    clusterGroupName: "KUCCPS Cluster 6: Architecture, Quantity Surveying & Building Construction",
    minimumMeanGrade: "C+",
    clusterSubjects: ["Mathematics", "Geography", "Physics or Chemistry", "English or Kiswahili"],
    subjectRequirements: [
      { subject: "Mathematics", minGrade: "C+" },
      { subject: "Geography", minGrade: "C+" },
      { subject: "Physics", minGrade: "C", alternativeSubjects: ["Chemistry", "Computer Studies"] }
    ],
    historicalCutoffs: { "2023/2024": 34.5, "2024/2025": 35.2 },
    institutions: [
      { institutionId: "inst-6", institutionCode: "116", institutionName: "Technical University of Kenya", county: "Nairobi", type: "Public University", historicalCutoffs: { "2023/2024": 35.2, "2024/2025": 35.9 } },
      { institutionId: "inst-10", institutionCode: "120", institutionName: "Dedan Kimathi University of Technology", county: "Nyeri", type: "Public University", historicalCutoffs: { "2023/2024": 34.1, "2024/2025": 34.8 } }
    ],
    active: true,
    notes: "GIS mapping, satellite remote sensing, photogrammetry, drone survey analytics, and land spatial registers."
  },
  // =========================================================================
  // COMPUTING & ADVANCED DATA (Cluster 7)
  // =========================================================================
  {
    id: "prog-datasci-deg",
    code: "1111701",
    name: "Bachelor of Science in Data Science and Analytics",
    level: "Degree",
    category: "Computing & IT",
    clusterNumber: 7,
    clusterGroupName: "KUCCPS Cluster 7: Computing, Information Technology & Software Engineering",
    minimumMeanGrade: "C+",
    clusterSubjects: ["Mathematics", "Physics or Chemistry", "Computer Studies or Any Science", "English or Kiswahili"],
    subjectRequirements: [
      { subject: "Mathematics", minGrade: "B-" },
      { subject: "Physics", minGrade: "C+", alternativeSubjects: ["Chemistry", "Computer Studies"] },
      { subject: "English", minGrade: "C", alternativeSubjects: ["Kiswahili"] }
    ],
    historicalCutoffs: { "2023/2024": 37.8, "2024/2025": 38.5 },
    institutions: [
      { institutionId: "inst-3", institutionCode: "113", institutionName: "Jomo Kenyatta University of Agriculture and Technology", county: "Kiambu", type: "Public University", historicalCutoffs: { "2023/2024": 39.5, "2024/2025": 40.2 } },
      { institutionId: "inst-1", institutionCode: "111", institutionName: "University of Nairobi", county: "Nairobi", type: "Public University", historicalCutoffs: { "2023/2024": 41.2, "2024/2025": 41.8 } },
      { institutionId: "inst-8", institutionCode: "118", institutionName: "Strathmore University", county: "Nairobi", type: "Private University", historicalCutoffs: { "2023/2024": 35.5, "2024/2025": 36.2 } }
    ],
    active: true,
    notes: "Big data pipelines, statistical machine learning, business intelligence, and predictive modeling."
  },
  {
    id: "prog-appcomp-deg",
    code: "1111702",
    name: "Bachelor of Science in Applied Computer Technology",
    level: "Degree",
    category: "Computing & IT",
    clusterNumber: 7,
    clusterGroupName: "KUCCPS Cluster 7: Computing, Information Technology & Software Engineering",
    minimumMeanGrade: "C+",
    clusterSubjects: ["Mathematics", "Physics or Chemistry", "Computer Studies or Science", "English or Kiswahili"],
    subjectRequirements: [
      { subject: "Mathematics", minGrade: "C+" },
      { subject: "English", minGrade: "C", alternativeSubjects: ["Kiswahili"] }
    ],
    historicalCutoffs: { "2023/2024": 33.4, "2024/2025": 34.1 },
    institutions: [
      { institutionId: "inst-24", institutionCode: "127", institutionName: "United States International University Africa", county: "Nairobi", type: "Private University", historicalCutoffs: { "2023/2024": 32.5, "2024/2025": 33.2 } },
      { institutionId: "inst-10", institutionCode: "120", institutionName: "Dedan Kimathi University of Technology", county: "Nyeri", type: "Public University", historicalCutoffs: { "2023/2024": 34.2, "2024/2025": 34.9 } }
    ],
    active: true,
    notes: "Focus on cloud engineering, mobile enterprise computing, and full-stack systems implementation."
  },
  // =========================================================================
  // PURE & APPLIED SCIENCES (Cluster 11 & 4)
  // =========================================================================
  {
    id: "prog-mol-biochem-deg",
    code: "1111111",
    name: "Bachelor of Science in Biochemistry & Molecular Biology",
    level: "Degree",
    category: "Pure & Applied Sciences",
    clusterNumber: 11,
    clusterGroupName: "KUCCPS Cluster 11: Pure & Applied Sciences, Chemistry, Biology & Biotechnology",
    minimumMeanGrade: "C+",
    clusterSubjects: ["Biology", "Chemistry", "Mathematics or Physics", "English or Kiswahili"],
    subjectRequirements: [
      { subject: "Biology", minGrade: "C+" },
      { subject: "Chemistry", minGrade: "C+" },
      { subject: "Mathematics", minGrade: "C", alternativeSubjects: ["Physics"] }
    ],
    historicalCutoffs: { "2023/2024": 35.8, "2024/2025": 36.5 },
    institutions: [
      { institutionId: "inst-1", institutionCode: "111", institutionName: "University of Nairobi", county: "Nairobi", type: "Public University", historicalCutoffs: { "2023/2024": 37.5, "2024/2025": 38.2 } },
      { institutionId: "inst-3", institutionCode: "113", institutionName: "Jomo Kenyatta University of Agriculture and Technology", county: "Kiambu", type: "Public University", historicalCutoffs: { "2023/2024": 36.4, "2024/2025": 37.1 } },
      { institutionId: "inst-2", institutionCode: "112", institutionName: "Kenyatta University", county: "Kiambu", type: "Public University", historicalCutoffs: { "2023/2024": 35.1, "2024/2025": 35.8 } }
    ],
    active: true,
    notes: "Enzymology, genomics, pharmaceutical synthesis, vaccine research (KEMRI), and clinical biochemistry."
  },
  {
    id: "prog-applied-chem-deg",
    code: "1111112",
    name: "Bachelor of Science in Industrial Chemistry",
    level: "Degree",
    category: "Pure & Applied Sciences",
    clusterNumber: 11,
    clusterGroupName: "KUCCPS Cluster 11: Pure & Applied Sciences, Chemistry, Biology & Biotechnology",
    minimumMeanGrade: "C+",
    clusterSubjects: ["Chemistry", "Mathematics", "Physics", "English or Kiswahili"],
    subjectRequirements: [
      { subject: "Chemistry", minGrade: "C+" },
      { subject: "Mathematics", minGrade: "C+" },
      { subject: "Physics", minGrade: "C" }
    ],
    historicalCutoffs: { "2023/2024": 35.2, "2024/2025": 35.9 },
    institutions: [
      { institutionId: "inst-1", institutionCode: "111", institutionName: "University of Nairobi", county: "Nairobi", type: "Public University", historicalCutoffs: { "2023/2024": 36.8, "2024/2025": 37.5 } },
      { institutionId: "inst-3", institutionCode: "113", institutionName: "Jomo Kenyatta University of Agriculture and Technology", county: "Kiambu", type: "Public University", historicalCutoffs: { "2023/2024": 35.4, "2024/2025": 36.1 } }
    ],
    active: true,
    notes: "Manufacturing chemical plants, polymer synthesis, cosmetics production, paint formulation, and KEBS standards."
  },
  {
    id: "prog-analytical-chem-deg",
    code: "1111113",
    name: "Bachelor of Science in Analytical Chemistry",
    level: "Degree",
    category: "Pure & Applied Sciences",
    clusterNumber: 11,
    clusterGroupName: "KUCCPS Cluster 11: Pure & Applied Sciences, Chemistry, Biology & Biotechnology",
    minimumMeanGrade: "C+",
    clusterSubjects: ["Chemistry", "Mathematics", "Physics or Biology", "English or Kiswahili"],
    subjectRequirements: [
      { subject: "Chemistry", minGrade: "C+" },
      { subject: "Mathematics", minGrade: "C" },
      { subject: "Physics", minGrade: "C", alternativeSubjects: ["Biology"] }
    ],
    historicalCutoffs: { "2023/2024": 33.6, "2024/2025": 34.3 },
    institutions: [
      { institutionId: "inst-2", institutionCode: "112", institutionName: "Kenyatta University", county: "Kiambu", type: "Public University", historicalCutoffs: { "2023/2024": 34.8, "2024/2025": 35.5 } },
      { institutionId: "inst-11", institutionCode: "121", institutionName: "Masinde Muliro University of Science and Technology", county: "Kakamega", type: "Public University", historicalCutoffs: { "2023/2024": 32.5, "2024/2025": 33.2 } }
    ],
    active: true,
    notes: "Chromatography (HPLC, GC-MS), spectroscopic assay, forensic substance testing, and environmental water analysis."
  },
  {
    id: "prog-meteorology-deg",
    code: "1111404",
    name: "Bachelor of Science in Meteorology",
    level: "Degree",
    category: "Pure & Applied Sciences",
    clusterNumber: 4,
    clusterGroupName: "KUCCPS Cluster 4: Geosciences, Environmental Sciences & Natural Resources",
    minimumMeanGrade: "C+",
    clusterSubjects: ["Mathematics", "Physics", "Chemistry or Geography", "English or Kiswahili"],
    subjectRequirements: [
      { subject: "Mathematics", minGrade: "C+" },
      { subject: "Physics", minGrade: "C+" },
      { subject: "Geography", minGrade: "C", alternativeSubjects: ["Chemistry"] }
    ],
    historicalCutoffs: { "2023/2024": 35.8, "2024/2025": 36.5 },
    institutions: [
      { institutionId: "inst-1", institutionCode: "111", institutionName: "University of Nairobi", county: "Nairobi", type: "Public University", historicalCutoffs: { "2023/2024": 36.8, "2024/2025": 37.5 } }
    ],
    active: true,
    notes: "Kenya Meteorological Department, climate modeling, aviation meteorology, and extreme weather forecasting."
  },
  {
    id: "prog-geology-deg",
    code: "1111405",
    name: "Bachelor of Science in Geology",
    level: "Degree",
    category: "Pure & Applied Sciences",
    clusterNumber: 4,
    clusterGroupName: "KUCCPS Cluster 4: Geosciences, Environmental Sciences & Natural Resources",
    minimumMeanGrade: "C+",
    clusterSubjects: ["Chemistry", "Physics", "Mathematics", "Geography or Biology"],
    subjectRequirements: [
      { subject: "Chemistry", minGrade: "C+" },
      { subject: "Mathematics", minGrade: "C+" },
      { subject: "Physics", minGrade: "C+", alternativeSubjects: ["Geography"] }
    ],
    historicalCutoffs: { "2023/2024": 34.6, "2024/2025": 35.3 },
    institutions: [
      { institutionId: "inst-1", institutionCode: "111", institutionName: "University of Nairobi", county: "Nairobi", type: "Public University", historicalCutoffs: { "2023/2024": 36.2, "2024/2025": 36.9 } },
      { institutionId: "inst-21", institutionCode: "129", institutionName: "South Eastern Kenya University", county: "Kitui", type: "Public University", historicalCutoffs: { "2023/2024": 31.8, "2024/2025": 32.5 } }
    ],
    active: true,
    notes: "Geothermal exploration (KenGen, GDC), groundwater hydrogeology, mineral exploration, and geotechnical testing."
  },
  // =========================================================================
  // BUSINESS, COOPERATIVES & FINANCE (Cluster 2 & 10)
  // =========================================================================
  {
    id: "prog-coop-biz-deg",
    code: "1111204",
    name: "Bachelor of Co-operative Business & Management",
    level: "Degree",
    category: "Business & Finance",
    clusterNumber: 2,
    clusterGroupName: "KUCCPS Cluster 2: Business, Commerce & Financial Studies",
    minimumMeanGrade: "C+",
    clusterSubjects: ["Mathematics", "English or Kiswahili", "Business Studies or Economics", "Any Group II/III/IV"],
    subjectRequirements: [
      { subject: "Mathematics", minGrade: "C" },
      { subject: "English", minGrade: "C", alternativeSubjects: ["Kiswahili"] }
    ],
    historicalCutoffs: { "2023/2024": 28.5, "2024/2025": 29.2 },
    institutions: [
      { institutionId: "inst-15", institutionCode: "125", institutionName: "The Co-operative University of Kenya", county: "Nairobi", type: "Public University", historicalCutoffs: { "2023/2024": 29.8, "2024/2025": 30.5 } }
    ],
    active: true,
    notes: "SACCO leadership, cooperative societies federation, agricultural marketing unions, and financial inclusion."
  },
  {
    id: "prog-microfinance-deg",
    code: "1111205",
    name: "Bachelor of Science in Microfinance and Community Banking",
    level: "Degree",
    category: "Business & Finance",
    clusterNumber: 2,
    clusterGroupName: "KUCCPS Cluster 2: Business, Commerce & Financial Studies",
    minimumMeanGrade: "C+",
    clusterSubjects: ["Mathematics", "English or Kiswahili", "Economics or Business Studies", "Any 4th Subject"],
    subjectRequirements: [
      { subject: "Mathematics", minGrade: "C" },
      { subject: "English", minGrade: "C", alternativeSubjects: ["Kiswahili"] }
    ],
    historicalCutoffs: { "2023/2024": 29.1, "2024/2025": 29.8 },
    institutions: [
      { institutionId: "inst-15", institutionCode: "125", institutionName: "The Co-operative University of Kenya", county: "Nairobi", type: "Public University", historicalCutoffs: { "2023/2024": 29.5, "2024/2025": 30.2 } }
    ],
    active: true,
    notes: "Credit risk assessment, micro-lending operations, rural community banking, and SME financial advisory."
  },
  {
    id: "prog-disaster-mgmt-deg",
    code: "1111304",
    name: "Bachelor of Science in Disaster Management & Humanitarian Assistance",
    level: "Degree",
    category: "Law & Governance",
    clusterNumber: 3,
    clusterGroupName: "KUCCPS Cluster 3: Social Sciences, Arts & Humanities",
    minimumMeanGrade: "C+",
    clusterSubjects: ["Geography", "English or Kiswahili", "Biology or Any Science", "Any 4th Subject"],
    subjectRequirements: [
      { subject: "Geography", minGrade: "C+" },
      { subject: "English", minGrade: "C", alternativeSubjects: ["Kiswahili"] }
    ],
    historicalCutoffs: { "2023/2024": 30.5, "2024/2025": 31.2 },
    institutions: [
      { institutionId: "inst-11", institutionCode: "121", institutionName: "Masinde Muliro University of Science and Technology", county: "Kakamega", type: "Public University", historicalCutoffs: { "2023/2024": 31.5, "2024/2025": 32.2 } }
    ],
    active: true,
    notes: "Kenya Red Cross, NDOC emergency response, drought mitigation, conflict resolution, and UN humanitarian logistics."
  },
  // =========================================================================
  // ENVIRONMENT, FISHERIES & FORESTRY (Cluster 4)
  // =========================================================================
  {
    id: "prog-fisheries-deg",
    code: "1111402",
    name: "Bachelor of Science in Fisheries and Aquaculture",
    level: "Degree",
    category: "Agriculture & Environment",
    clusterNumber: 4,
    clusterGroupName: "KUCCPS Cluster 4: Geosciences, Environmental Sciences & Natural Resources",
    minimumMeanGrade: "C+",
    clusterSubjects: ["Biology", "Chemistry", "Mathematics or Physics", "English or Kiswahili"],
    subjectRequirements: [
      { subject: "Biology", minGrade: "C+" },
      { subject: "Chemistry", minGrade: "C" },
      { subject: "Mathematics", minGrade: "C-", alternativeSubjects: ["Agriculture"] }
    ],
    historicalCutoffs: { "2023/2024": 29.8, "2024/2025": 30.5 },
    institutions: [
      { institutionId: "inst-4", institutionCode: "114", institutionName: "Moi University", county: "Uasin Gishu", type: "Public University", historicalCutoffs: { "2023/2024": 31.2, "2024/2025": 31.9 } },
      { institutionId: "inst-5", institutionCode: "115", institutionName: "Egerton University", county: "Nakuru", type: "Public University", historicalCutoffs: { "2023/2024": 30.5, "2024/2025": 31.2 } }
    ],
    active: true,
    notes: "Lake Victoria & coastal marine fisheries, fish hatchery farming, and aquatic ecosystem management."
  },
  {
    id: "prog-forestry-deg",
    code: "1111403",
    name: "Bachelor of Science in Forestry",
    level: "Degree",
    category: "Agriculture & Environment",
    clusterNumber: 4,
    clusterGroupName: "KUCCPS Cluster 4: Geosciences, Environmental Sciences & Natural Resources",
    minimumMeanGrade: "C+",
    clusterSubjects: ["Biology", "Geography or Chemistry", "Mathematics or Physics", "English or Kiswahili"],
    subjectRequirements: [
      { subject: "Biology", minGrade: "C+" },
      { subject: "Chemistry", minGrade: "C", alternativeSubjects: ["Geography", "Agriculture"] },
      { subject: "Mathematics", minGrade: "C-" }
    ],
    historicalCutoffs: { "2023/2024": 28.5, "2024/2025": 29.2 },
    institutions: [
      { institutionId: "inst-18", institutionCode: "130", institutionName: "University of Eldoret", county: "Uasin Gishu", type: "Public University", historicalCutoffs: { "2023/2024": 29.8, "2024/2025": 30.5 } }
    ],
    active: true,
    notes: "Kenya Forest Service (KFS), carbon credit accounting, agroforestry, and timber plantation management."
  },
  // =========================================================================
  // EDUCATION (Cluster 16)
  // =========================================================================
  {
    id: "prog-bed-sne-deg",
    code: "1111605",
    name: "Bachelor of Education in Special Needs Education (Primary / Secondary)",
    level: "Degree",
    category: "Education",
    clusterNumber: 16,
    clusterGroupName: "KUCCPS Cluster 16: Education (Arts)",
    minimumMeanGrade: "C+",
    clusterSubjects: ["English or Kiswahili", "Teaching Subject 1", "Teaching Subject 2", "Any 4th Subject"],
    subjectRequirements: [
      { subject: "English", minGrade: "C+", alternativeSubjects: ["Kiswahili"] }
    ],
    historicalCutoffs: { "2023/2024": 31.2, "2024/2025": 31.9 },
    institutions: [
      { institutionId: "inst-2", institutionCode: "112", institutionName: "Kenyatta University", county: "Kiambu", type: "Public University", historicalCutoffs: { "2023/2024": 33.1, "2024/2025": 33.8 } },
      { institutionId: "inst-7", institutionCode: "117", institutionName: "Maseno University", county: "Kisumu", type: "Public University", historicalCutoffs: { "2023/2024": 31.2, "2024/2025": 31.9 } },
      { institutionId: "inst-11", institutionCode: "121", institutionName: "Masinde Muliro University of Science and Technology", county: "Kakamega", type: "Public University", historicalCutoffs: { "2023/2024": 29.8, "2024/2025": 30.5 } }
    ],
    active: true,
    notes: "TSC certified specialization for visual impairments (Braille), hearing impairments (Sign Language), and autism."
  },
  {
    id: "prog-bed-ecde-deg",
    code: "1111606",
    name: "Bachelor of Education in Early Childhood Development Education",
    level: "Degree",
    category: "Education",
    clusterNumber: 16,
    clusterGroupName: "KUCCPS Cluster 16: Education (Arts)",
    minimumMeanGrade: "C+",
    clusterSubjects: ["English or Kiswahili", "Any Language/Humanity", "Any Science/Maths", "Any 4th Subject"],
    subjectRequirements: [
      { subject: "English", minGrade: "C+", alternativeSubjects: ["Kiswahili"] }
    ],
    historicalCutoffs: { "2023/2024": 28.5, "2024/2025": 29.2 },
    institutions: [
      { institutionId: "inst-2", institutionCode: "112", institutionName: "Kenyatta University", county: "Kiambu", type: "Public University", historicalCutoffs: { "2023/2024": 31.2, "2024/2025": 31.9 } },
      { institutionId: "inst-4", institutionCode: "114", institutionName: "Moi University", county: "Uasin Gishu", type: "Public University", historicalCutoffs: { "2023/2024": 29.5, "2024/2025": 30.2 } },
      { institutionId: "inst-7", institutionCode: "117", institutionName: "Maseno University", county: "Kisumu", type: "Public University", historicalCutoffs: { "2023/2024": 28.2, "2024/2025": 28.9 } }
    ],
    active: true,
    notes: "County Government ECDE directors, early childhood pedagogy, curriculum design, and child psychology."
  },
  // =========================================================================
  // LAW, HUMANITIES, SOCIAL SCIENCES & ARTS (Cluster 1, 3, 14)
  // =========================================================================
  {
    id: "prog-criminology-deg",
    code: "1111102",
    name: "Bachelor of Arts in Criminology and Criminal Justice",
    level: "Degree",
    category: "Law & Governance",
    clusterNumber: 1,
    clusterGroupName: "KUCCPS Cluster 1: Law & Legal Studies",
    minimumMeanGrade: "C+",
    clusterSubjects: ["English or Kiswahili", "History and Government", "Mathematics or Science", "Any 4th Subject"],
    subjectRequirements: [
      { subject: "English", minGrade: "C+", alternativeSubjects: ["Kiswahili"] },
      { subject: "History and Government", minGrade: "C", alternativeSubjects: ["Geography", "CRE", "IRE"] }
    ],
    historicalCutoffs: { "2023/2024": 33.2, "2024/2025": 33.9 },
    institutions: [
      { institutionId: "inst-5", institutionCode: "115", institutionName: "Egerton University", county: "Nakuru", type: "Public University", historicalCutoffs: { "2023/2024": 34.8, "2024/2025": 35.5 } },
      { institutionId: "inst-14", institutionCode: "124", institutionName: "Kisii University", county: "Kisii", type: "Public University", historicalCutoffs: { "2023/2024": 32.5, "2024/2025": 33.2 } },
      { institutionId: "inst-10", institutionCode: "120", institutionName: "Dedan Kimathi University of Technology", county: "Nyeri", type: "Public University", historicalCutoffs: { "2023/2024": 33.1, "2024/2025": 33.8 } },
      { institutionId: "inst-11", institutionCode: "121", institutionName: "Masinde Muliro University of Science and Technology", county: "Kakamega", type: "Public University", historicalCutoffs: { "2023/2024": 31.9, "2024/2025": 32.6 } }
    ],
    active: true,
    notes: "DCI forensic profiling, Kenya Prisons Service, National Police Service, and private corporate security."
  },
  {
    id: "prog-ir-deg",
    code: "1111301",
    name: "Bachelor of Arts in International Relations and Diplomacy",
    level: "Degree",
    category: "Law & Governance",
    clusterNumber: 3,
    clusterGroupName: "KUCCPS Cluster 3: Social Sciences, Arts & Humanities",
    minimumMeanGrade: "C+",
    clusterSubjects: ["English", "History and Government", "Kiswahili or Any Language", "Any 4th Subject"],
    subjectRequirements: [
      { subject: "English", minGrade: "B-", alternativeSubjects: ["Kiswahili"] },
      { subject: "History and Government", minGrade: "C+", alternativeSubjects: ["Geography", "Economics"] }
    ],
    historicalCutoffs: { "2023/2024": 35.4, "2024/2025": 36.1 },
    institutions: [
      { institutionId: "inst-1", institutionCode: "111", institutionName: "University of Nairobi", county: "Nairobi", type: "Public University", historicalCutoffs: { "2023/2024": 38.5, "2024/2025": 39.2 } },
      { institutionId: "inst-24", institutionCode: "127", institutionName: "United States International University Africa", county: "Nairobi", type: "Private University", historicalCutoffs: { "2023/2024": 34.2, "2024/2025": 34.9 } },
      { institutionId: "inst-7", institutionCode: "117", institutionName: "Maseno University", county: "Kisumu", type: "Public University", historicalCutoffs: { "2023/2024": 33.8, "2024/2025": 34.5 } }
    ],
    active: true,
    notes: "Ministry of Foreign Affairs, UN agencies (UNEP, UN-Habitat), embassy diplomatic missions, and NGO governance."
  },
  {
    id: "prog-pubadmin-deg",
    code: "1111302",
    name: "Bachelor of Public Administration and Governance",
    level: "Degree",
    category: "Law & Governance",
    clusterNumber: 3,
    clusterGroupName: "KUCCPS Cluster 3: Social Sciences, Arts & Humanities",
    minimumMeanGrade: "C+",
    clusterSubjects: ["English or Kiswahili", "History and Government", "Mathematics or Business", "Any 4th Subject"],
    subjectRequirements: [
      { subject: "English", minGrade: "C+", alternativeSubjects: ["Kiswahili"] },
      { subject: "History and Government", minGrade: "C", alternativeSubjects: ["Business Studies", "Economics"] }
    ],
    historicalCutoffs: { "2023/2024": 32.8, "2024/2025": 33.5 },
    institutions: [
      { institutionId: "inst-2", institutionCode: "112", institutionName: "Kenyatta University", county: "Kiambu", type: "Public University", historicalCutoffs: { "2023/2024": 34.5, "2024/2025": 35.2 } },
      { institutionId: "inst-4", institutionCode: "114", institutionName: "Moi University", county: "Uasin Gishu", type: "Public University", historicalCutoffs: { "2023/2024": 32.1, "2024/2025": 32.8 } },
      { institutionId: "inst-17", institutionCode: "133", institutionName: "Machakos University", county: "Machakos", type: "Public University", historicalCutoffs: { "2023/2024": 30.5, "2024/2025": 31.2 } }
    ],
    active: true,
    notes: "County Commissioners, Public Service Commission, municipal administration, and devolved governance."
  },
  {
    id: "prog-peace-conflict-deg",
    code: "1111305",
    name: "Bachelor of Arts in Peace and Conflict Studies",
    level: "Degree",
    category: "Law & Governance",
    clusterNumber: 3,
    clusterGroupName: "KUCCPS Cluster 3: Social Sciences, Arts & Humanities",
    minimumMeanGrade: "C+",
    clusterSubjects: ["English or Kiswahili", "History and Government", "Geography or Religious Education", "Any 4th Subject"],
    subjectRequirements: [
      { subject: "English", minGrade: "C+", alternativeSubjects: ["Kiswahili"] },
      { subject: "History and Government", minGrade: "C", alternativeSubjects: ["Christian Religious Education", "Geography"] }
    ],
    historicalCutoffs: { "2023/2024": 31.2, "2024/2025": 31.9 },
    institutions: [
      { institutionId: "inst-11", institutionCode: "121", institutionName: "Masinde Muliro University of Science and Technology", county: "Kakamega", type: "Public University", historicalCutoffs: { "2023/2024": 32.2, "2024/2025": 32.9 } },
      { institutionId: "inst-5", institutionCode: "115", institutionName: "Egerton University", county: "Nakuru", type: "Public University", historicalCutoffs: { "2023/2024": 31.5, "2024/2025": 32.2 } }
    ],
    active: true,
    notes: "National Cohesion and Integration Commission (NCIC), mediation, refugee affairs, and regional border security."
  },
  {
    id: "prog-music-deg",
    code: "1111406",
    name: "Bachelor of Arts in Music",
    level: "Degree",
    category: "Hospitality & Creative",
    clusterNumber: 14,
    clusterGroupName: "KUCCPS Cluster 14: Film, Animation, Theatre & Performing Arts",
    minimumMeanGrade: "C+",
    clusterSubjects: ["Music or Talent Subject", "English or Kiswahili", "Any Humanity", "Any 4th Subject"],
    subjectRequirements: [
      { subject: "Music", minGrade: "C+", alternativeSubjects: ["English", "Kiswahili"] }
    ],
    historicalCutoffs: { "2023/2024": 29.5, "2024/2025": 30.2 },
    institutions: [
      { institutionId: "inst-2", institutionCode: "112", institutionName: "Kenyatta University", county: "Kiambu", type: "Public University", historicalCutoffs: { "2023/2024": 31.8, "2024/2025": 32.5 } },
      { institutionId: "inst-28", institutionCode: "136", institutionName: "Kabarak University", county: "Nakuru", type: "Private University", historicalCutoffs: { "2023/2024": 28.5, "2024/2025": 29.2 } }
    ],
    active: true,
    notes: "Composition, orchestral conducting, music technology sound engineering, and ethnomusicology."
  },
  {
    id: "prog-theatre-deg",
    code: "1111407",
    name: "Bachelor of Arts in Theatre Arts and Film Technology",
    level: "Degree",
    category: "Hospitality & Creative",
    clusterNumber: 14,
    clusterGroupName: "KUCCPS Cluster 14: Film, Animation, Theatre & Performing Arts",
    minimumMeanGrade: "C+",
    clusterSubjects: ["English or Kiswahili", "Literature or History", "Any Group II/III/IV", "Any 4th Subject"],
    subjectRequirements: [
      { subject: "English", minGrade: "C+", alternativeSubjects: ["Kiswahili"] }
    ],
    historicalCutoffs: { "2023/2024": 30.1, "2024/2025": 30.8 },
    institutions: [
      { institutionId: "inst-2", institutionCode: "112", institutionName: "Kenyatta University", county: "Kiambu", type: "Public University", historicalCutoffs: { "2023/2024": 32.4, "2024/2025": 33.1 } },
      { institutionId: "inst-11", institutionCode: "121", institutionName: "Masinde Muliro University of Science and Technology", county: "Kakamega", type: "Public University", historicalCutoffs: { "2023/2024": 29.8, "2024/2025": 30.5 } }
    ],
    active: true,
    notes: "Film directing, television cinematography, scriptwriting, stage acting, and post-production editing."
  },
  // =========================================================================
  // TVET DIPLOMAS (Minimum C- / C)
  // =========================================================================
  {
    id: "prog-orthopaedic-dip",
    code: "2011905",
    name: "Diploma in Orthopaedic and Trauma Technology",
    level: "Diploma",
    category: "Health Sciences",
    clusterGroupName: "Health Sciences TVET & College Diploma Pathway",
    minimumMeanGrade: "C",
    subjectRequirements: [
      { subject: "Biology", minGrade: "C" },
      { subject: "English", minGrade: "C", alternativeSubjects: ["Kiswahili"] },
      { subject: "Physics", minGrade: "C-", alternativeSubjects: ["Mathematics", "Chemistry"] }
    ],
    institutions: [
      { institutionId: "inst-31", institutionCode: "137", institutionName: "Kenya Medical Training College (KMTC - Nairobi)", county: "Nairobi", type: "Medical College" },
      { institutionId: "inst-34", institutionCode: "140", institutionName: "KMTC Nakuru Campus", county: "Nakuru", type: "Medical College" },
      { institutionId: "inst-36", institutionCode: "142", institutionName: "KMTC Eldoret Campus", county: "Uasin Gishu", type: "Medical College" }
    ],
    active: true,
    notes: "Orthopaedic casting (plaster of Paris), bone traction, trauma splinting, and operating theatre assisting."
  },
  {
    id: "prog-dentaltech-dip",
    code: "2011906",
    name: "Diploma in Dental Technology",
    level: "Diploma",
    category: "Health Sciences",
    clusterGroupName: "Health Sciences TVET & College Diploma Pathway",
    minimumMeanGrade: "C",
    subjectRequirements: [
      { subject: "Physics", minGrade: "C", alternativeSubjects: ["Chemistry"] },
      { subject: "Biology", minGrade: "C" },
      { subject: "English", minGrade: "C", alternativeSubjects: ["Kiswahili"] }
    ],
    institutions: [
      { institutionId: "inst-31", institutionCode: "137", institutionName: "Kenya Medical Training College (KMTC - Nairobi)", county: "Nairobi", type: "Medical College" },
      { institutionId: "inst-33", institutionCode: "139", institutionName: "KMTC Mombasa Campus", county: "Mombasa", type: "Medical College" }
    ],
    active: true,
    notes: "Dental prosthetics fabrication, crowns and bridges, orthodontic appliances, and denture casting."
  },
  {
    id: "prog-civil-eng-dip",
    code: "2011501",
    name: "Diploma in Civil Engineering",
    level: "Diploma",
    category: "Engineering",
    clusterGroupName: "TVET Engineering Diploma Pathway",
    minimumMeanGrade: "C-",
    subjectRequirements: [
      { subject: "Mathematics", minGrade: "C-" },
      { subject: "Physics", minGrade: "C-" },
      { subject: "English", minGrade: "D+", alternativeSubjects: ["Kiswahili"] }
    ],
    institutions: [
      { institutionId: "inst-19", institutionCode: "201", institutionName: "Kabete National Polytechnic", county: "Nairobi", type: "National Polytechnic" },
      { institutionId: "inst-21", institutionCode: "203", institutionName: "Kisumu National Polytechnic", county: "Kisumu", type: "National Polytechnic" },
      { institutionId: "inst-22", institutionCode: "204", institutionName: "Eldoret National Polytechnic", county: "Uasin Gishu", type: "National Polytechnic" },
      { institutionId: "inst-23", institutionCode: "205", institutionName: "Rift Valley Institute of Science and Technology", county: "Nakuru", type: "Technical College" },
      { institutionId: "inst-24", institutionCode: "206", institutionName: "The Sigalagala National Polytechnic", county: "Kakamega", type: "National Polytechnic" }
    ],
    active: true,
    notes: "Structural engineering, highway construction, dam civil works, and surveyor engineering site supervision."
  },
  {
    id: "prog-mech-eng-dip",
    code: "2011502",
    name: "Diploma in Mechanical Engineering (Plant / Production Option)",
    level: "Diploma",
    category: "Engineering",
    clusterGroupName: "TVET Engineering Diploma Pathway",
    minimumMeanGrade: "C-",
    subjectRequirements: [
      { subject: "Mathematics", minGrade: "C-" },
      { subject: "Physics", minGrade: "C-" }
    ],
    institutions: [
      { institutionId: "inst-19", institutionCode: "201", institutionName: "Kabete National Polytechnic", county: "Nairobi", type: "National Polytechnic" },
      { institutionId: "inst-21", institutionCode: "203", institutionName: "Kisumu National Polytechnic", county: "Kisumu", type: "National Polytechnic" },
      { institutionId: "inst-23", institutionCode: "205", institutionName: "Rift Valley Institute of Science and Technology", county: "Nakuru", type: "Technical College" },
      { institutionId: "inst-26", institutionCode: "208", institutionName: "The Meru National Polytechnic", county: "Meru", type: "National Polytechnic" }
    ],
    active: true,
    notes: "CAD/CAM drafting, industrial milling and lathe fabrication, hydraulic systems, and manufacturing plant maintenance."
  },
  {
    id: "prog-arch-tech-dip",
    code: "2011601",
    name: "Diploma in Architectural Technology",
    level: "Diploma",
    category: "Architecture & Design",
    clusterGroupName: "TVET / National Polytechnic Diploma Pathway",
    minimumMeanGrade: "C-",
    subjectRequirements: [
      { subject: "Mathematics", minGrade: "C-" },
      { subject: "Physics", minGrade: "C-", alternativeSubjects: ["Art and Design", "Geography"] }
    ],
    institutions: [
      { institutionId: "inst-19", institutionCode: "201", institutionName: "Kabete National Polytechnic", county: "Nairobi", type: "National Polytechnic" },
      { institutionId: "inst-6", institutionCode: "116", institutionName: "Technical University of Kenya", county: "Nairobi", type: "Public University" },
      { institutionId: "inst-21", institutionCode: "203", institutionName: "Kisumu National Polytechnic", county: "Kisumu", type: "National Polytechnic" }
    ],
    active: true,
    notes: "BIM modeling, Revit/AutoCAD architectural working drawings, building bylaws, and site inspection."
  },
  {
    id: "prog-quantsurv-dip",
    code: "2011602",
    name: "Diploma in Quantity Surveying",
    level: "Diploma",
    category: "Architecture & Design",
    clusterGroupName: "TVET / National Polytechnic Diploma Pathway",
    minimumMeanGrade: "C-",
    subjectRequirements: [
      { subject: "Mathematics", minGrade: "C-" },
      { subject: "English", minGrade: "C-", alternativeSubjects: ["Kiswahili"] }
    ],
    institutions: [
      { institutionId: "inst-19", institutionCode: "201", institutionName: "Kabete National Polytechnic", county: "Nairobi", type: "National Polytechnic" },
      { institutionId: "inst-21", institutionCode: "203", institutionName: "Kisumu National Polytechnic", county: "Kisumu", type: "National Polytechnic" },
      { institutionId: "inst-23", institutionCode: "205", institutionName: "Rift Valley Institute of Science and Technology", county: "Nakuru", type: "Technical College" }
    ],
    active: true,
    notes: "Bills of Quantities (BQs) estimation, building contract administration, tendering, and project cost control."
  },
  {
    id: "prog-bldgtech-dip",
    code: "2011603",
    name: "Diploma in Building Technology",
    level: "Diploma",
    category: "Architecture & Design",
    clusterGroupName: "TVET / National Polytechnic Diploma Pathway",
    minimumMeanGrade: "C-",
    subjectRequirements: [
      { subject: "Mathematics", minGrade: "C-" },
      { subject: "Physics", minGrade: "C-", alternativeSubjects: ["Chemistry", "Art and Design"] }
    ],
    institutions: [
      { institutionId: "inst-19", institutionCode: "201", institutionName: "Kabete National Polytechnic", county: "Nairobi", type: "National Polytechnic" },
      { institutionId: "inst-23", institutionCode: "205", institutionName: "Rift Valley Institute of Science and Technology", county: "Nakuru", type: "Technical College" },
      { institutionId: "inst-22", institutionCode: "204", institutionName: "Eldoret National Polytechnic", county: "Uasin Gishu", type: "National Polytechnic" },
      { institutionId: "inst-24", institutionCode: "206", institutionName: "The Sigalagala National Polytechnic", county: "Kakamega", type: "National Polytechnic" }
    ],
    active: true,
    notes: "Site foreman supervision, concrete technology, masonry, structural framing, and construction safety."
  },
  {
    id: "prog-foodbev-dip",
    code: "2011201",
    name: "Diploma in Food and Beverage Management (Culinary Arts)",
    level: "Diploma",
    category: "Hospitality & Creative",
    clusterGroupName: "TVET Hospitality Diploma Pathway",
    minimumMeanGrade: "C-",
    subjectRequirements: [
      { subject: "English", minGrade: "C-", alternativeSubjects: ["Kiswahili"] },
      { subject: "Home Science", minGrade: "D+", alternativeSubjects: ["Biology", "Chemistry", "Business Studies"] }
    ],
    institutions: [
      { institutionId: "inst-37", institutionCode: "143", institutionName: "Kenya Utalii College", county: "Nairobi", type: "Technical College" },
      { institutionId: "inst-19", institutionCode: "201", institutionName: "Kabete National Polytechnic", county: "Nairobi", type: "National Polytechnic" },
      { institutionId: "inst-20", institutionCode: "202", institutionName: "Nairobi Technical Training Institute", county: "Nairobi", type: "Technical College" },
      { institutionId: "inst-23", institutionCode: "205", institutionName: "Rift Valley Institute of Science and Technology", county: "Nakuru", type: "Technical College" }
    ],
    active: true,
    notes: "Head chef culinary production, banquet catering, menu design, kitchen HACCP hygiene, and bar operations."
  },
  {
    id: "prog-tourism-dip",
    code: "2011202",
    name: "Diploma in Tourism and Tour Guiding Management",
    level: "Diploma",
    category: "Hospitality & Creative",
    clusterGroupName: "TVET Hospitality Diploma Pathway",
    minimumMeanGrade: "C-",
    subjectRequirements: [
      { subject: "English", minGrade: "C-", alternativeSubjects: ["Kiswahili"] },
      { subject: "Geography", minGrade: "D+", alternativeSubjects: ["History and Government"] }
    ],
    institutions: [
      { institutionId: "inst-37", institutionCode: "143", institutionName: "Kenya Utalii College", county: "Nairobi", type: "Technical College" },
      { institutionId: "inst-19", institutionCode: "201", institutionName: "Kabete National Polytechnic", county: "Nairobi", type: "National Polytechnic" },
      { institutionId: "inst-21", institutionCode: "203", institutionName: "Kisumu National Polytechnic", county: "Kisumu", type: "National Polytechnic" }
    ],
    active: true,
    notes: "Professional safari driver-guide operations, wildlife flora/fauna identification, and ticketing systems (Amadeus)."
  },
  {
    id: "prog-supplychain-dip",
    code: "2011203",
    name: "Diploma in Supply Chain Management",
    level: "Diploma",
    category: "Business & Finance",
    clusterGroupName: "TVET Business & Management Diploma Pathway",
    minimumMeanGrade: "C-",
    subjectRequirements: [
      { subject: "English", minGrade: "D+", alternativeSubjects: ["Kiswahili"] },
      { subject: "Mathematics", minGrade: "D+" }
    ],
    institutions: [
      { institutionId: "inst-19", institutionCode: "201", institutionName: "Kabete National Polytechnic", county: "Nairobi", type: "National Polytechnic" },
      { institutionId: "inst-21", institutionCode: "203", institutionName: "Kisumu National Polytechnic", county: "Kisumu", type: "National Polytechnic" },
      { institutionId: "inst-23", institutionCode: "205", institutionName: "Rift Valley Institute of Science and Technology", county: "Nakuru", type: "Technical College" },
      { institutionId: "inst-22", institutionCode: "204", institutionName: "Eldoret National Polytechnic", county: "Uasin Gishu", type: "National Polytechnic" }
    ],
    active: true,
    notes: "Public Procurement and Asset Disposal Act (PPADA), e-procurement IFMIS, warehouse inventory, and shipping logistics."
  },
  {
    id: "prog-masscomm-dip",
    code: "2011301",
    name: "Diploma in Journalism and Mass Media Production",
    level: "Diploma",
    category: "Hospitality & Creative",
    clusterGroupName: "TVET Media & Communication Diploma Pathway",
    minimumMeanGrade: "C-",
    subjectRequirements: [
      { subject: "English", minGrade: "C", alternativeSubjects: ["Kiswahili"] }
    ],
    institutions: [
      { institutionId: "inst-38", institutionCode: "144", institutionName: "Kenya Institute of Mass Communication (KIMC)", county: "Nairobi", type: "Technical College" },
      { institutionId: "inst-19", institutionCode: "201", institutionName: "Kabete National Polytechnic", county: "Nairobi", type: "National Polytechnic" },
      { institutionId: "inst-23", institutionCode: "205", institutionName: "Rift Valley Institute of Science and Technology", county: "Nakuru", type: "Technical College" }
    ],
    active: true,
    notes: "Radio broadcast presentation, television camera operation, investigative reporting, and digital podcasting."
  },
  {
    id: "prog-socwork-dip",
    code: "2011302",
    name: "Diploma in Social Work and Community Development",
    level: "Diploma",
    category: "Law & Governance",
    clusterGroupName: "TVET / National Polytechnic Diploma Pathway",
    minimumMeanGrade: "C-",
    subjectRequirements: [
      { subject: "English", minGrade: "D+", alternativeSubjects: ["Kiswahili"] }
    ],
    institutions: [
      { institutionId: "inst-19", institutionCode: "201", institutionName: "Kabete National Polytechnic", county: "Nairobi", type: "National Polytechnic" },
      { institutionId: "inst-21", institutionCode: "203", institutionName: "Kisumu National Polytechnic", county: "Kisumu", type: "National Polytechnic" },
      { institutionId: "inst-23", institutionCode: "205", institutionName: "Rift Valley Institute of Science and Technology", county: "Nakuru", type: "Technical College" }
    ],
    active: true,
    notes: "Community mobilization, NGO humanitarian project monitoring, child protection, and vulnerable social work."
  },
  {
    id: "prog-agri-dip",
    code: "2011801",
    name: "Diploma in General Agriculture",
    level: "Diploma",
    category: "Agriculture & Environment",
    clusterGroupName: "TVET Agricultural Diploma Pathway",
    minimumMeanGrade: "C-",
    subjectRequirements: [
      { subject: "Biology", minGrade: "C-", alternativeSubjects: ["Agriculture"] },
      { subject: "Chemistry", minGrade: "D+", alternativeSubjects: ["Mathematics", "Physics"] }
    ],
    institutions: [
      { institutionId: "inst-39", institutionCode: "145", institutionName: "Bukura Agricultural College", county: "Kakamega", type: "Technical College" },
      { institutionId: "inst-23", institutionCode: "205", institutionName: "Rift Valley Institute of Science and Technology", county: "Nakuru", type: "Technical College" },
      { institutionId: "inst-19", institutionCode: "201", institutionName: "Kabete National Polytechnic", county: "Nairobi", type: "National Polytechnic" }
    ],
    active: true,
    notes: "County agricultural extension officer roles, farm management, seed propagation, and pest management."
  },
  // =========================================================================
  // TVET CERTIFICATES & ARTISANS (Minimum D / E)
  // =========================================================================
  {
    id: "prog-plumbing-cert",
    code: "2011991",
    name: "Certificate in Plumbing and Pipefitting",
    level: "Certificate",
    category: "Professional & Technical",
    clusterGroupName: "TVET Certificate Pathway",
    minimumMeanGrade: "D",
    subjectRequirements: [
      { subject: "Mathematics", minGrade: "D-" }
    ],
    institutions: [
      { institutionId: "inst-19", institutionCode: "201", institutionName: "Kabete National Polytechnic", county: "Nairobi", type: "National Polytechnic" },
      { institutionId: "inst-23", institutionCode: "205", institutionName: "Rift Valley Institute of Science and Technology", county: "Nakuru", type: "Technical College" },
      { institutionId: "inst-21", institutionCode: "203", institutionName: "Kisumu National Polytechnic", county: "Kisumu", type: "National Polytechnic" },
      { institutionId: "inst-24", institutionCode: "206", institutionName: "The Sigalagala National Polytechnic", county: "Kakamega", type: "National Polytechnic" }
    ],
    active: true,
    notes: "Domestic water supply piping, commercial wastewater drainage, sanitary fixture installation, and water pump maintenance."
  },
  {
    id: "prog-welding-cert",
    code: "2011992",
    name: "Certificate in Arc Welding and Metal Fabrication",
    level: "Certificate",
    category: "Engineering",
    clusterGroupName: "TVET Certificate Pathway",
    minimumMeanGrade: "D",
    subjectRequirements: [
      { subject: "Mathematics", minGrade: "D-" }
    ],
    institutions: [
      { institutionId: "inst-19", institutionCode: "201", institutionName: "Kabete National Polytechnic", county: "Nairobi", type: "National Polytechnic" },
      { institutionId: "inst-23", institutionCode: "205", institutionName: "Rift Valley Institute of Science and Technology", county: "Nakuru", type: "Technical College" },
      { institutionId: "inst-22", institutionCode: "204", institutionName: "Eldoret National Polytechnic", county: "Uasin Gishu", type: "National Polytechnic" },
      { institutionId: "inst-24", institutionCode: "206", institutionName: "The Sigalagala National Polytechnic", county: "Kakamega", type: "National Polytechnic" }
    ],
    active: true,
    notes: "Shielded Metal Arc Welding (SMAW), structural steel fabrication, pipeline joining, and pressure tank fabrication."
  },
  {
    id: "prog-foodbev-cert",
    code: "2011993",
    name: "Certificate in Food and Beverage Production & Service",
    level: "Certificate",
    category: "Hospitality & Creative",
    clusterGroupName: "TVET Certificate Pathway",
    minimumMeanGrade: "D",
    subjectRequirements: [],
    institutions: [
      { institutionId: "inst-19", institutionCode: "201", institutionName: "Kabete National Polytechnic", county: "Nairobi", type: "National Polytechnic" },
      { institutionId: "inst-20", institutionCode: "202", institutionName: "Nairobi Technical Training Institute", county: "Nairobi", type: "Technical College" },
      { institutionId: "inst-23", institutionCode: "205", institutionName: "Rift Valley Institute of Science and Technology", county: "Nakuru", type: "Technical College" }
    ],
    active: true,
    notes: "Commercial kitchen cookery, restaurant service etiquette, barista coffee brewing, and banquet meal service."
  },
  {
    id: "prog-carpentry-artisan",
    code: "2011994",
    name: "Artisan in Carpentry and Joinery",
    level: "Artisan",
    category: "Professional & Technical",
    clusterGroupName: "TVET Artisan Pathway",
    minimumMeanGrade: "E",
    subjectRequirements: [],
    institutions: [
      { institutionId: "inst-19", institutionCode: "201", institutionName: "Kabete National Polytechnic", county: "Nairobi", type: "National Polytechnic" },
      { institutionId: "inst-23", institutionCode: "205", institutionName: "Rift Valley Institute of Science and Technology", county: "Nakuru", type: "Technical College" },
      { institutionId: "inst-24", institutionCode: "206", institutionName: "The Sigalagala National Polytechnic", county: "Kakamega", type: "National Polytechnic" },
      { institutionId: "inst-21", institutionCode: "203", institutionName: "Kisumu National Polytechnic", county: "Kisumu", type: "National Polytechnic" }
    ],
    active: true,
    notes: "Roof truss erection, furniture joinery, wood cabinetry, and building timber works open to all KCSE grades."
  },
  {
    id: "prog-plumbing-artisan",
    code: "2011995",
    name: "Artisan in Plumbing & Pipefitting",
    level: "Artisan",
    category: "Professional & Technical",
    clusterGroupName: "TVET Artisan Pathway",
    minimumMeanGrade: "E",
    subjectRequirements: [],
    institutions: [
      { institutionId: "inst-19", institutionCode: "201", institutionName: "Kabete National Polytechnic", county: "Nairobi", type: "National Polytechnic" },
      { institutionId: "inst-23", institutionCode: "205", institutionName: "Rift Valley Institute of Science and Technology", county: "Nakuru", type: "Technical College" },
      { institutionId: "inst-21", institutionCode: "203", institutionName: "Kisumu National Polytechnic", county: "Kisumu", type: "National Polytechnic" },
      { institutionId: "inst-24", institutionCode: "206", institutionName: "The Sigalagala National Polytechnic", county: "Kakamega", type: "National Polytechnic" }
    ],
    active: true,
    notes: "Basic water piping, drainage repair, and bathroom fixture installation open to all KCSE grades."
  },
  {
    id: "prog-motor-artisan",
    code: "2011996",
    name: "Artisan in Motor Vehicle Mechanics",
    level: "Artisan",
    category: "Engineering",
    clusterGroupName: "TVET Artisan Pathway",
    minimumMeanGrade: "E",
    subjectRequirements: [],
    institutions: [
      { institutionId: "inst-19", institutionCode: "201", institutionName: "Kabete National Polytechnic", county: "Nairobi", type: "National Polytechnic" },
      { institutionId: "inst-23", institutionCode: "205", institutionName: "Rift Valley Institute of Science and Technology", county: "Nakuru", type: "Technical College" },
      { institutionId: "inst-24", institutionCode: "206", institutionName: "The Sigalagala National Polytechnic", county: "Kakamega", type: "National Polytechnic" },
      { institutionId: "inst-22", institutionCode: "204", institutionName: "Eldoret National Polytechnic", county: "Uasin Gishu", type: "National Polytechnic" }
    ],
    active: true,
    notes: "Practical automotive garage apprenticeship: engine tuning, brake overhaul, and suspension servicing."
  }
];

// src/data/kuccpsData.ts
var KENYAN_INSTITUTIONS = ALL_514_KENYAN_INSTITUTIONS;
var INITIAL_PROGRAMMES = [
  // =========================================================================
  // 1. COMPUTING, INFORMATION TECHNOLOGY & SOFTWARE (Cluster 7)
  // =========================================================================
  {
    id: "prog-cs-deg",
    code: "1111101",
    name: "Bachelor of Science in Computer Science",
    level: "Degree",
    category: "Computing & IT",
    clusterNumber: 7,
    clusterGroupName: "KUCCPS Cluster 7: Computing, Information Technology & Software Engineering",
    minimumMeanGrade: "C+",
    clusterSubjects: ["Mathematics", "Physics or Chemistry", "Computer Studies or Any Science", "English or Kiswahili"],
    subjectRequirements: [
      { subject: "Mathematics", minGrade: "C+" },
      { subject: "Physics", minGrade: "C+", alternativeSubjects: ["Chemistry", "Computer Studies", "Physical Sciences"] }
    ],
    historicalCutoffs: { "2023/2024": 39.5, "2024/2025": 40.2 },
    institutions: [
      { institutionId: "inst-1", institutionCode: "111", institutionName: "University of Nairobi", county: "Nairobi", type: "Public University", historicalCutoffs: { "2023/2024": 43.8, "2024/2025": 44.4 } },
      { institutionId: "inst-3", institutionCode: "113", institutionName: "Jomo Kenyatta University of Agriculture and Technology", county: "Kiambu", type: "Public University", historicalCutoffs: { "2023/2024": 41.2, "2024/2025": 41.8 } },
      { institutionId: "inst-2", institutionCode: "112", institutionName: "Kenyatta University", county: "Kiambu", type: "Public University", historicalCutoffs: { "2023/2024": 39.2, "2024/2025": 39.8 } },
      { institutionId: "inst-6", institutionCode: "116", institutionName: "Technical University of Kenya", county: "Nairobi", type: "Public University", historicalCutoffs: { "2023/2024": 36.8, "2024/2025": 37.5 } },
      { institutionId: "inst-8", institutionCode: "118", institutionName: "Strathmore University", county: "Nairobi", type: "Private University", historicalCutoffs: { "2023/2024": 34.8, "2024/2025": 35.5 } },
      { institutionId: "inst-11", institutionCode: "121", institutionName: "Masinde Muliro University of Science and Technology", county: "Kakamega", type: "Public University", historicalCutoffs: { "2023/2024": 33.6, "2024/2025": 34.2 } }
    ],
    active: true,
    notes: "Requires strong analytical foundations in Mathematics and Physical Sciences."
  },
  {
    id: "prog-se-deg",
    code: "1131105",
    name: "Bachelor of Science in Software Engineering",
    level: "Degree",
    category: "Computing & IT",
    clusterNumber: 7,
    clusterGroupName: "KUCCPS Cluster 7: Computing, Information Technology & Software Engineering",
    minimumMeanGrade: "C+",
    clusterSubjects: ["Mathematics", "Physics or Chemistry", "Computer Studies or Any Science", "English or Kiswahili"],
    subjectRequirements: [
      { subject: "Mathematics", minGrade: "C+" },
      { subject: "Physics", minGrade: "C+", alternativeSubjects: ["Chemistry", "Computer Studies", "General Science"] }
    ],
    historicalCutoffs: { "2023/2024": 37.8, "2024/2025": 38.5 },
    institutions: [
      { institutionId: "inst-3", institutionCode: "113", institutionName: "Jomo Kenyatta University of Agriculture and Technology", county: "Kiambu", type: "Public University", historicalCutoffs: { "2023/2024": 39.8, "2024/2025": 40.5 } },
      { institutionId: "inst-9", institutionCode: "119", institutionName: "Multimedia University of Kenya", county: "Nairobi", type: "Public University", historicalCutoffs: { "2023/2024": 35.6, "2024/2025": 36.3 } },
      { institutionId: "inst-10", institutionCode: "120", institutionName: "Dedan Kimathi University of Technology", county: "Nyeri", type: "Public University", historicalCutoffs: { "2023/2024": 35.2, "2024/2025": 35.9 } },
      { institutionId: "inst-14", institutionCode: "124", institutionName: "Kisii University", county: "Kisii", type: "Public University", historicalCutoffs: { "2023/2024": 32, "2024/2025": 32.8 } }
    ],
    active: true,
    notes: "Focuses on software architecture, programming, algorithms, and engineering practices."
  },
  {
    id: "prog-it-deg",
    code: "1121112",
    name: "Bachelor of Science in Information Technology",
    level: "Degree",
    category: "Computing & IT",
    clusterNumber: 7,
    clusterGroupName: "KUCCPS Cluster 7: Computing, Information Technology & Software Engineering",
    minimumMeanGrade: "C+",
    clusterSubjects: ["Mathematics", "English or Kiswahili", "Physics or Chemistry or Computer Studies", "Any 4th Subject"],
    subjectRequirements: [
      { subject: "Mathematics", minGrade: "C" },
      { subject: "English", minGrade: "C", alternativeSubjects: ["Kiswahili"] }
    ],
    historicalCutoffs: { "2023/2024": 34.2, "2024/2025": 34.9 },
    institutions: [
      { institutionId: "inst-2", institutionCode: "112", institutionName: "Kenyatta University", county: "Kiambu", type: "Public University", historicalCutoffs: { "2023/2024": 35, "2024/2025": 35.7 } },
      { institutionId: "inst-3", institutionCode: "113", institutionName: "Jomo Kenyatta University of Agriculture and Technology", county: "Kiambu", type: "Public University", historicalCutoffs: { "2023/2024": 35.8, "2024/2025": 36.5 } },
      { institutionId: "inst-7", institutionCode: "117", institutionName: "Maseno University", county: "Kisumu", type: "Public University", historicalCutoffs: { "2023/2024": 32.8, "2024/2025": 33.5 } },
      { institutionId: "inst-11", institutionCode: "121", institutionName: "Masinde Muliro University of Science and Technology", county: "Kakamega", type: "Public University", historicalCutoffs: { "2023/2024": 31.8, "2024/2025": 32.5 } },
      { institutionId: "inst-12", institutionCode: "122", institutionName: "Chuka University", county: "Tharaka Nithi", type: "Public University", historicalCutoffs: { "2023/2024": 30.2, "2024/2025": 31 } },
      { institutionId: "inst-16", institutionCode: "126", institutionName: "Meru University of Science and Technology", county: "Meru", type: "Public University", historicalCutoffs: { "2023/2024": 29.5, "2024/2025": 30.2 } }
    ],
    active: true,
    notes: "Covers database administration, networking, systems analysis, and enterprise IT management."
  },
  {
    id: "prog-cyber-deg",
    code: "1191140",
    name: "Bachelor of Science in Cybersecurity",
    level: "Degree",
    category: "Computing & IT",
    clusterNumber: 7,
    clusterGroupName: "KUCCPS Cluster 7: Computing, Information Technology & Software Engineering",
    minimumMeanGrade: "C+",
    clusterSubjects: ["Mathematics", "Physics or Chemistry", "Computer Studies or Any Science", "English or Kiswahili"],
    subjectRequirements: [
      { subject: "Mathematics", minGrade: "C+" },
      { subject: "Physics", minGrade: "C", alternativeSubjects: ["Chemistry", "Computer Studies"] }
    ],
    historicalCutoffs: { "2023/2024": 35.5, "2024/2025": 36.2 },
    institutions: [
      { institutionId: "inst-9", institutionCode: "119", institutionName: "Multimedia University of Kenya", county: "Nairobi", type: "Public University", historicalCutoffs: { "2023/2024": 35.8, "2024/2025": 36.5 } },
      { institutionId: "inst-10", institutionCode: "120", institutionName: "Dedan Kimathi University of Technology", county: "Nyeri", type: "Public University", historicalCutoffs: { "2023/2024": 35, "2024/2025": 35.8 } },
      { institutionId: "inst-14", institutionCode: "124", institutionName: "Kisii University", county: "Kisii", type: "Public University", historicalCutoffs: { "2023/2024": 31.8, "2024/2025": 32.5 } },
      { institutionId: "inst-41", institutionCode: "141", institutionName: "Kabarak University", county: "Nakuru", type: "Private University", historicalCutoffs: { "2023/2024": 30.2, "2024/2025": 31 } }
    ],
    active: true,
    notes: "Focuses on network defense, cryptography, digital forensics, ethical hacking, and threat mitigation."
  },
  {
    id: "prog-ds-deg",
    code: "1131165",
    name: "Bachelor of Science in Data Science and Analytics",
    level: "Degree",
    category: "Computing & IT",
    clusterNumber: 7,
    clusterGroupName: "KUCCPS Cluster 7: Computing, Information Technology & Software Engineering",
    minimumMeanGrade: "C+",
    clusterSubjects: ["Mathematics", "Physics or Chemistry", "Computer Studies or Any Science", "English or Kiswahili"],
    subjectRequirements: [
      { subject: "Mathematics", minGrade: "C+" },
      { subject: "English", minGrade: "C", alternativeSubjects: ["Kiswahili"] }
    ],
    historicalCutoffs: { "2023/2024": 37.2, "2024/2025": 38 },
    institutions: [
      { institutionId: "inst-3", institutionCode: "113", institutionName: "Jomo Kenyatta University of Agriculture and Technology", county: "Kiambu", type: "Public University", historicalCutoffs: { "2023/2024": 38.2, "2024/2025": 39 } },
      { institutionId: "inst-2", institutionCode: "112", institutionName: "Kenyatta University", county: "Kiambu", type: "Public University", historicalCutoffs: { "2023/2024": 37, "2024/2025": 37.8 } },
      { institutionId: "inst-8", institutionCode: "118", institutionName: "Strathmore University", county: "Nairobi", type: "Private University", historicalCutoffs: { "2023/2024": 34.8, "2024/2025": 35.6 } }
    ],
    active: true,
    notes: "Integrates statistical modeling, machine learning, big data architectures, and algorithms."
  },
  {
    id: "prog-bbit-deg",
    code: "1181155",
    name: "Bachelor of Business Information Technology (BBIT)",
    level: "Degree",
    category: "Computing & IT",
    clusterNumber: 2,
    clusterGroupName: "KUCCPS Cluster 2: Business, Commerce & Financial Studies",
    minimumMeanGrade: "C+",
    clusterSubjects: ["Mathematics", "English or Kiswahili", "Business Studies or Economics or Geography", "Any Science or Computer Studies"],
    subjectRequirements: [
      { subject: "Mathematics", minGrade: "C" },
      { subject: "English", minGrade: "C", alternativeSubjects: ["Kiswahili"] }
    ],
    historicalCutoffs: { "2023/2024": 32.8, "2024/2025": 33.5 },
    institutions: [
      { institutionId: "inst-8", institutionCode: "118", institutionName: "Strathmore University", county: "Nairobi", type: "Private University", historicalCutoffs: { "2023/2024": 33.2, "2024/2025": 34 } },
      { institutionId: "inst-3", institutionCode: "113", institutionName: "Jomo Kenyatta University of Agriculture and Technology", county: "Kiambu", type: "Public University", historicalCutoffs: { "2023/2024": 34, "2024/2025": 34.8 } },
      { institutionId: "inst-13", institutionCode: "123", institutionName: "Machakos University", county: "Machakos", type: "Public University", historicalCutoffs: { "2023/2024": 29.5, "2024/2025": 30.2 } },
      { institutionId: "inst-43", institutionCode: "143", institutionName: "KCA University", county: "Nairobi", type: "Private University", historicalCutoffs: { "2023/2024": 28.5, "2024/2025": 29.2 } }
    ],
    active: true,
    notes: "Combines commerce, organizational systems, enterprise IT, and e-business."
  },
  {
    id: "prog-comptech-deg",
    code: "1131170",
    name: "Bachelor of Science in Computer Technology",
    level: "Degree",
    category: "Computing & IT",
    clusterNumber: 7,
    clusterGroupName: "KUCCPS Cluster 7: Computing, Information Technology & Software Engineering",
    minimumMeanGrade: "C+",
    clusterSubjects: ["Mathematics", "Physics", "Computer Studies or Chemistry", "English or Kiswahili"],
    subjectRequirements: [
      { subject: "Mathematics", minGrade: "C+" },
      { subject: "Physics", minGrade: "C", alternativeSubjects: ["Chemistry", "Computer Studies"] }
    ],
    historicalCutoffs: { "2023/2024": 34.5, "2024/2025": 35.2 },
    institutions: [
      { institutionId: "inst-3", institutionCode: "113", institutionName: "Jomo Kenyatta University of Agriculture and Technology", county: "Kiambu", type: "Public University", historicalCutoffs: { "2023/2024": 35.8, "2024/2025": 36.5 } },
      { institutionId: "inst-11", institutionCode: "121", institutionName: "Masinde Muliro University of Science and Technology", county: "Kakamega", type: "Public University", historicalCutoffs: { "2023/2024": 32.8, "2024/2025": 33.5 } },
      { institutionId: "inst-16", institutionCode: "126", institutionName: "Meru University of Science and Technology", county: "Meru", type: "Public University", historicalCutoffs: { "2023/2024": 30.8, "2024/2025": 31.5 } }
    ],
    active: true,
    notes: "Practical systems, embedded electronics, and modern hardware-software interfaces."
  },
  {
    id: "prog-infosys-deg",
    code: "1121180",
    name: "Bachelor of Science in Information Systems",
    level: "Degree",
    category: "Computing & IT",
    clusterNumber: 7,
    clusterGroupName: "KUCCPS Cluster 7: Computing, Information Technology & Software Engineering",
    minimumMeanGrade: "C+",
    clusterSubjects: ["Mathematics", "English or Kiswahili", "Computer Studies or Physics or Chemistry", "Business Studies or Economics or Geography"],
    subjectRequirements: [
      { subject: "Mathematics", minGrade: "C" },
      { subject: "English", minGrade: "C", alternativeSubjects: ["Kiswahili"] }
    ],
    historicalCutoffs: { "2023/2024": 33.2, "2024/2025": 33.8 },
    institutions: [
      { institutionId: "inst-2", institutionCode: "112", institutionName: "Kenyatta University", county: "Kiambu", type: "Public University", historicalCutoffs: { "2023/2024": 34, "2024/2025": 34.8 } },
      { institutionId: "inst-7", institutionCode: "117", institutionName: "Maseno University", county: "Kisumu", type: "Public University", historicalCutoffs: { "2023/2024": 31.8, "2024/2025": 32.5 } }
    ],
    active: true,
    notes: "Focuses on enterprise architecture, ERP systems, digital strategy, and business data flow."
  },
  // =========================================================================
  // 2. ENGINEERING & TECHNOLOGY (Cluster 5)
  // =========================================================================
  {
    id: "prog-eee-deg",
    code: "1111201",
    name: "Bachelor of Science in Electrical and Electronic Engineering",
    level: "Degree",
    category: "Engineering",
    clusterNumber: 5,
    clusterGroupName: "KUCCPS Cluster 5: Engineering & Technology",
    minimumMeanGrade: "C+",
    clusterSubjects: ["Mathematics", "Physics", "Chemistry", "English or Kiswahili or Geography or Biology"],
    subjectRequirements: [
      { subject: "Mathematics", minGrade: "C+" },
      { subject: "Physics", minGrade: "C+" },
      { subject: "Chemistry", minGrade: "C+" }
    ],
    historicalCutoffs: { "2023/2024": 40.8, "2024/2025": 41.5 },
    institutions: [
      { institutionId: "inst-1", institutionCode: "111", institutionName: "University of Nairobi", county: "Nairobi", type: "Public University", historicalCutoffs: { "2023/2024": 42.4, "2024/2025": 43.1 } },
      { institutionId: "inst-3", institutionCode: "113", institutionName: "Jomo Kenyatta University of Agriculture and Technology", county: "Kiambu", type: "Public University", historicalCutoffs: { "2023/2024": 41.6, "2024/2025": 42.3 } },
      { institutionId: "inst-6", institutionCode: "116", institutionName: "Technical University of Kenya", county: "Nairobi", type: "Public University", historicalCutoffs: { "2023/2024": 37.5, "2024/2025": 38.2 } },
      { institutionId: "inst-10", institutionCode: "120", institutionName: "Dedan Kimathi University of Technology", county: "Nyeri", type: "Public University", historicalCutoffs: { "2023/2024": 36.8, "2024/2025": 37.5 } },
      { institutionId: "inst-4", institutionCode: "114", institutionName: "Moi University", county: "Uasin Gishu", type: "Public University", historicalCutoffs: { "2023/2024": 35.8, "2024/2025": 36.5 } },
      { institutionId: "inst-15", institutionCode: "125", institutionName: "Technical University of Mombasa", county: "Mombasa", type: "Public University", historicalCutoffs: { "2023/2024": 34.5, "2024/2025": 35.2 } }
    ],
    active: true,
    notes: "Engineers Board of Kenya (EBK) accredited curriculum in power systems and telecommunications."
  },
  {
    id: "prog-mech-deg",
    code: "1111202",
    name: "Bachelor of Science in Mechanical Engineering",
    level: "Degree",
    category: "Engineering",
    clusterNumber: 5,
    clusterGroupName: "KUCCPS Cluster 5: Engineering & Technology",
    minimumMeanGrade: "C+",
    clusterSubjects: ["Mathematics", "Physics", "Chemistry", "English or Kiswahili or Geography"],
    subjectRequirements: [
      { subject: "Mathematics", minGrade: "C+" },
      { subject: "Physics", minGrade: "C+" },
      { subject: "Chemistry", minGrade: "C+" }
    ],
    historicalCutoffs: { "2023/2024": 39.5, "2024/2025": 40.2 },
    institutions: [
      { institutionId: "inst-1", institutionCode: "111", institutionName: "University of Nairobi", county: "Nairobi", type: "Public University", historicalCutoffs: { "2023/2024": 41.2, "2024/2025": 41.8 } },
      { institutionId: "inst-3", institutionCode: "113", institutionName: "Jomo Kenyatta University of Agriculture and Technology", county: "Kiambu", type: "Public University", historicalCutoffs: { "2023/2024": 40.4, "2024/2025": 41 } },
      { institutionId: "inst-10", institutionCode: "120", institutionName: "Dedan Kimathi University of Technology", county: "Nyeri", type: "Public University", historicalCutoffs: { "2023/2024": 35.5, "2024/2025": 36.2 } },
      { institutionId: "inst-15", institutionCode: "125", institutionName: "Technical University of Mombasa", county: "Mombasa", type: "Public University", historicalCutoffs: { "2023/2024": 34.2, "2024/2025": 35 } }
    ],
    active: true,
    notes: "Focuses on thermodynamics, mechanics of machines, manufacturing, and CAD."
  },
  {
    id: "prog-civil-deg",
    code: "1111203",
    name: "Bachelor of Science in Civil Engineering",
    level: "Degree",
    category: "Engineering",
    clusterNumber: 5,
    clusterGroupName: "KUCCPS Cluster 5: Engineering & Technology",
    minimumMeanGrade: "C+",
    clusterSubjects: ["Mathematics", "Physics", "Chemistry", "English or Kiswahili or Geography"],
    subjectRequirements: [
      { subject: "Mathematics", minGrade: "C+" },
      { subject: "Physics", minGrade: "C+" },
      { subject: "Chemistry", minGrade: "C+" }
    ],
    historicalCutoffs: { "2023/2024": 40.2, "2024/2025": 40.8 },
    institutions: [
      { institutionId: "inst-1", institutionCode: "111", institutionName: "University of Nairobi", county: "Nairobi", type: "Public University", historicalCutoffs: { "2023/2024": 42, "2024/2025": 42.6 } },
      { institutionId: "inst-3", institutionCode: "113", institutionName: "Jomo Kenyatta University of Agriculture and Technology", county: "Kiambu", type: "Public University", historicalCutoffs: { "2023/2024": 41.2, "2024/2025": 41.8 } },
      { institutionId: "inst-6", institutionCode: "116", institutionName: "Technical University of Kenya", county: "Nairobi", type: "Public University", historicalCutoffs: { "2023/2024": 36.8, "2024/2025": 37.5 } },
      { institutionId: "inst-4", institutionCode: "114", institutionName: "Moi University", county: "Uasin Gishu", type: "Public University", historicalCutoffs: { "2023/2024": 35.2, "2024/2025": 36 } }
    ],
    active: true,
    notes: "Covers structural analysis, hydraulics, geotechnical engineering, and transportation infrastructure."
  },
  {
    id: "prog-mechatronics-deg",
    code: "1131208",
    name: "Bachelor of Science in Mechatronic Engineering",
    level: "Degree",
    category: "Engineering",
    clusterNumber: 5,
    clusterGroupName: "KUCCPS Cluster 5: Engineering & Technology",
    minimumMeanGrade: "C+",
    clusterSubjects: ["Mathematics", "Physics", "Chemistry", "English or Kiswahili or Computer Studies"],
    subjectRequirements: [
      { subject: "Mathematics", minGrade: "C+" },
      { subject: "Physics", minGrade: "C+" },
      { subject: "Chemistry", minGrade: "C+" }
    ],
    historicalCutoffs: { "2023/2024": 39, "2024/2025": 39.8 },
    institutions: [
      { institutionId: "inst-3", institutionCode: "113", institutionName: "Jomo Kenyatta University of Agriculture and Technology", county: "Kiambu", type: "Public University", historicalCutoffs: { "2023/2024": 40.8, "2024/2025": 41.5 } },
      { institutionId: "inst-10", institutionCode: "120", institutionName: "Dedan Kimathi University of Technology", county: "Nyeri", type: "Public University", historicalCutoffs: { "2023/2024": 36.8, "2024/2025": 37.5 } }
    ],
    active: true,
    notes: "Synergy of robotics, embedded systems, electronics, and mechanical engineering."
  },
  {
    id: "prog-agribio-eng-deg",
    code: "1131215",
    name: "Bachelor of Science in Agricultural and Biosystems Engineering",
    level: "Degree",
    category: "Engineering",
    clusterNumber: 5,
    clusterGroupName: "KUCCPS Cluster 5: Engineering & Technology",
    minimumMeanGrade: "C+",
    clusterSubjects: ["Mathematics", "Physics", "Chemistry", "Biology or Agriculture"],
    subjectRequirements: [
      { subject: "Mathematics", minGrade: "C+" },
      { subject: "Physics", minGrade: "C+" },
      { subject: "Chemistry", minGrade: "C+" }
    ],
    historicalCutoffs: { "2023/2024": 33.5, "2024/2025": 34.2 },
    institutions: [
      { institutionId: "inst-3", institutionCode: "113", institutionName: "Jomo Kenyatta University of Agriculture and Technology", county: "Kiambu", type: "Public University", historicalCutoffs: { "2023/2024": 35, "2024/2025": 35.8 } },
      { institutionId: "inst-5", institutionCode: "115", institutionName: "Egerton University", county: "Nakuru", type: "Public University", historicalCutoffs: { "2023/2024": 32.5, "2024/2025": 33.2 } }
    ],
    active: true,
    notes: "Focuses on irrigation machinery, post-harvest engineering, soil water conservation, and renewable agro-energy."
  },
  {
    id: "prog-telecom-eng-deg",
    code: "1131220",
    name: "Bachelor of Science in Telecommunications and Information Engineering",
    level: "Degree",
    category: "Engineering",
    clusterNumber: 5,
    clusterGroupName: "KUCCPS Cluster 5: Engineering & Technology",
    minimumMeanGrade: "C+",
    clusterSubjects: ["Mathematics", "Physics", "Chemistry", "English or Kiswahili"],
    subjectRequirements: [
      { subject: "Mathematics", minGrade: "C+" },
      { subject: "Physics", minGrade: "C+" },
      { subject: "Chemistry", minGrade: "C+" }
    ],
    historicalCutoffs: { "2023/2024": 37.5, "2024/2025": 38.2 },
    institutions: [
      { institutionId: "inst-3", institutionCode: "113", institutionName: "Jomo Kenyatta University of Agriculture and Technology", county: "Kiambu", type: "Public University", historicalCutoffs: { "2023/2024": 38.5, "2024/2025": 39.2 } },
      { institutionId: "inst-9", institutionCode: "119", institutionName: "Multimedia University of Kenya", county: "Nairobi", type: "Public University", historicalCutoffs: { "2023/2024": 34.5, "2024/2025": 35.2 } }
    ],
    active: true,
    notes: "Signal processing, wireless networks, optical communication, and satellite systems."
  },
  {
    id: "prog-chem-eng-deg",
    code: "1141225",
    name: "Bachelor of Science in Chemical and Process Engineering",
    level: "Degree",
    category: "Engineering",
    clusterNumber: 5,
    clusterGroupName: "KUCCPS Cluster 5: Engineering & Technology",
    minimumMeanGrade: "C+",
    clusterSubjects: ["Mathematics", "Physics", "Chemistry", "English or Kiswahili or Biology"],
    subjectRequirements: [
      { subject: "Mathematics", minGrade: "C+" },
      { subject: "Physics", minGrade: "C+" },
      { subject: "Chemistry", minGrade: "C+" }
    ],
    historicalCutoffs: { "2023/2024": 36.5, "2024/2025": 37.2 },
    institutions: [
      { institutionId: "inst-4", institutionCode: "114", institutionName: "Moi University", county: "Uasin Gishu", type: "Public University", historicalCutoffs: { "2023/2024": 37.5, "2024/2025": 38.2 } },
      { institutionId: "inst-6", institutionCode: "116", institutionName: "Technical University of Kenya", county: "Nairobi", type: "Public University", historicalCutoffs: { "2023/2024": 35.2, "2024/2025": 36 } }
    ],
    active: true,
    notes: "Industrial plant synthesis, oil refining, biofuels, cosmetics manufacturing, and pharmaceutical processing."
  },
  {
    id: "prog-geospatial-eng-deg",
    code: "1111235",
    name: "Bachelor of Science in Geospatial Information and Geomatics Engineering",
    level: "Degree",
    category: "Engineering",
    clusterNumber: 5,
    clusterGroupName: "KUCCPS Cluster 5: Engineering & Technology",
    minimumMeanGrade: "C+",
    clusterSubjects: ["Mathematics", "Physics", "Geography", "English or Kiswahili or Chemistry"],
    subjectRequirements: [
      { subject: "Mathematics", minGrade: "C+" },
      { subject: "Physics", minGrade: "C+" }
    ],
    historicalCutoffs: { "2023/2024": 36.5, "2024/2025": 37.2 },
    institutions: [
      { institutionId: "inst-1", institutionCode: "111", institutionName: "University of Nairobi", county: "Nairobi", type: "Public University", historicalCutoffs: { "2023/2024": 38.2, "2024/2025": 39 } },
      { institutionId: "inst-3", institutionCode: "113", institutionName: "Jomo Kenyatta University of Agriculture and Technology", county: "Kiambu", type: "Public University", historicalCutoffs: { "2023/2024": 37.2, "2024/2025": 38 } },
      { institutionId: "inst-6", institutionCode: "116", institutionName: "Technical University of Kenya", county: "Nairobi", type: "Public University", historicalCutoffs: { "2023/2024": 34.8, "2024/2025": 35.5 } }
    ],
    active: true,
    notes: "GIS mapping, satellite geodesy, photogrammetry, remote sensing, and land cadastral surveying."
  },
  // =========================================================================
  // 3. ARCHITECTURE & BUILT ENVIRONMENT (Cluster 6)
  // =========================================================================
  {
    id: "prog-arch-deg",
    code: "1111301",
    name: "Bachelor of Architecture",
    level: "Degree",
    category: "Architecture & Design",
    clusterNumber: 6,
    clusterGroupName: "KUCCPS Cluster 6: Architecture, Quantity Surveying & Building Construction",
    minimumMeanGrade: "C+",
    clusterSubjects: ["Mathematics", "Physics", "Geography or History or Economics or Art and Design", "English or Kiswahili or Chemistry"],
    subjectRequirements: [
      { subject: "Mathematics", minGrade: "C+" },
      { subject: "Physics", minGrade: "C+" },
      { subject: "English", minGrade: "C", alternativeSubjects: ["Kiswahili"] }
    ],
    historicalCutoffs: { "2023/2024": 40.8, "2024/2025": 41.5 },
    institutions: [
      { institutionId: "inst-1", institutionCode: "111", institutionName: "University of Nairobi", county: "Nairobi", type: "Public University", historicalCutoffs: { "2023/2024": 42.2, "2024/2025": 42.8 } },
      { institutionId: "inst-3", institutionCode: "113", institutionName: "Jomo Kenyatta University of Agriculture and Technology", county: "Kiambu", type: "Public University", historicalCutoffs: { "2023/2024": 41.2, "2024/2025": 41.9 } },
      { institutionId: "inst-6", institutionCode: "116", institutionName: "Technical University of Kenya", county: "Nairobi", type: "Public University", historicalCutoffs: { "2023/2024": 37.8, "2024/2025": 38.5 } }
    ],
    active: true,
    notes: "Accredited by Board of Registration of Architects and Quantity Surveyors (BORAQS)."
  },
  {
    id: "prog-qs-deg",
    code: "1111302",
    name: "Bachelor of Construction Management / Quantity Surveying",
    level: "Degree",
    category: "Architecture & Design",
    clusterNumber: 6,
    clusterGroupName: "KUCCPS Cluster 6: Architecture, Quantity Surveying & Building Construction",
    minimumMeanGrade: "C+",
    clusterSubjects: ["Mathematics", "Physics", "Geography or Economics or Business Studies", "English or Kiswahili"],
    subjectRequirements: [
      { subject: "Mathematics", minGrade: "C+" },
      { subject: "Physics", minGrade: "C", alternativeSubjects: ["Chemistry", "Biology", "Business Studies"] }
    ],
    historicalCutoffs: { "2023/2024": 37.8, "2024/2025": 38.5 },
    institutions: [
      { institutionId: "inst-1", institutionCode: "111", institutionName: "University of Nairobi", county: "Nairobi", type: "Public University", historicalCutoffs: { "2023/2024": 39.5, "2024/2025": 40.2 } },
      { institutionId: "inst-3", institutionCode: "113", institutionName: "Jomo Kenyatta University of Agriculture and Technology", county: "Kiambu", type: "Public University", historicalCutoffs: { "2023/2024": 38.5, "2024/2025": 39.2 } },
      { institutionId: "inst-6", institutionCode: "116", institutionName: "Technical University of Kenya", county: "Nairobi", type: "Public University", historicalCutoffs: { "2023/2024": 35.8, "2024/2025": 36.5 } }
    ],
    active: true,
    notes: "Covers cost estimation, project procurement, contractual law, and construction management."
  },
  {
    id: "prog-urban-plan-deg",
    code: "1111310",
    name: "Bachelor of Science in Urban and Regional Planning",
    level: "Degree",
    category: "Architecture & Design",
    clusterNumber: 6,
    clusterGroupName: "KUCCPS Cluster 6: Architecture, Quantity Surveying & Building Construction",
    minimumMeanGrade: "C+",
    clusterSubjects: ["Mathematics", "Geography", "Economics or History and Government", "English or Kiswahili"],
    subjectRequirements: [
      { subject: "Mathematics", minGrade: "C" },
      { subject: "Geography", minGrade: "C+" }
    ],
    historicalCutoffs: { "2023/2024": 34.5, "2024/2025": 35.2 },
    institutions: [
      { institutionId: "inst-1", institutionCode: "111", institutionName: "University of Nairobi", county: "Nairobi", type: "Public University", historicalCutoffs: { "2023/2024": 36.2, "2024/2025": 36.9 } },
      { institutionId: "inst-2", institutionCode: "112", institutionName: "Kenyatta University", county: "Kiambu", type: "Public University", historicalCutoffs: { "2023/2024": 34.2, "2024/2025": 35 } },
      { institutionId: "inst-7", institutionCode: "117", institutionName: "Maseno University", county: "Kisumu", type: "Public University", historicalCutoffs: { "2023/2024": 31.8, "2024/2025": 32.5 } }
    ],
    active: true,
    notes: "Physical land use planning, municipal zoning, transport design, and urban sustainability."
  },
  {
    id: "prog-landscape-deg",
    code: "1131315",
    name: "Bachelor of Science in Landscape Architecture",
    level: "Degree",
    category: "Architecture & Design",
    clusterNumber: 6,
    clusterGroupName: "KUCCPS Cluster 6: Architecture, Quantity Surveying & Building Construction",
    minimumMeanGrade: "C+",
    clusterSubjects: ["Mathematics", "Biology or Geography", "Art and Design or Physics", "English or Kiswahili"],
    subjectRequirements: [
      { subject: "Mathematics", minGrade: "C" },
      { subject: "Biology", minGrade: "C", alternativeSubjects: ["Geography", "Art and Design", "Agriculture"] }
    ],
    historicalCutoffs: { "2023/2024": 34, "2024/2025": 34.8 },
    institutions: [
      { institutionId: "inst-3", institutionCode: "113", institutionName: "Jomo Kenyatta University of Agriculture and Technology", county: "Kiambu", type: "Public University", historicalCutoffs: { "2023/2024": 34.5, "2024/2025": 35.2 } }
    ],
    active: true,
    notes: "Urban parks, ecological landscape design, public outdoor spaces, and botanical conservatories."
  },
  // =========================================================================
  // 4. HEALTH & MEDICAL SCIENCES (Cluster 9)
  // =========================================================================
  {
    id: "prog-med-deg",
    code: "1111401",
    name: "Bachelor of Medicine and Bachelor of Surgery (MBChB)",
    level: "Degree",
    category: "Health Sciences",
    clusterNumber: 9,
    clusterGroupName: "KUCCPS Cluster 9: Medicine, Pharmacy, Nursing & Health Sciences",
    minimumMeanGrade: "B",
    clusterSubjects: ["Biology", "Chemistry", "Mathematics or Physics", "English or Kiswahili"],
    subjectRequirements: [
      { subject: "Biology", minGrade: "B" },
      { subject: "Chemistry", minGrade: "B" },
      { subject: "Mathematics", minGrade: "C+", alternativeSubjects: ["Physics"] },
      { subject: "English", minGrade: "B", alternativeSubjects: ["Kiswahili"] }
    ],
    historicalCutoffs: { "2023/2024": 44, "2024/2025": 44.5 },
    institutions: [
      { institutionId: "inst-1", institutionCode: "111", institutionName: "University of Nairobi", county: "Nairobi", type: "Public University", historicalCutoffs: { "2023/2024": 44.6, "2024/2025": 45 } },
      { institutionId: "inst-4", institutionCode: "114", institutionName: "Moi University", county: "Uasin Gishu", type: "Public University", historicalCutoffs: { "2023/2024": 43.5, "2024/2025": 44 } },
      { institutionId: "inst-2", institutionCode: "112", institutionName: "Kenyatta University", county: "Kiambu", type: "Public University", historicalCutoffs: { "2023/2024": 43.6, "2024/2025": 44.2 } },
      { institutionId: "inst-5", institutionCode: "115", institutionName: "Egerton University", county: "Nakuru", type: "Public University", historicalCutoffs: { "2023/2024": 42.5, "2024/2025": 43 } },
      { institutionId: "inst-7", institutionCode: "117", institutionName: "Maseno University", county: "Kisumu", type: "Public University", historicalCutoffs: { "2023/2024": 42, "2024/2025": 42.6 } },
      { institutionId: "inst-14", institutionCode: "124", institutionName: "Kisii University", county: "Kisii", type: "Public University", historicalCutoffs: { "2023/2024": 41.5, "2024/2025": 42 } }
    ],
    active: true,
    notes: "Kenya Medical Practitioners and Dentists Council (KMPDC) regulated programme."
  },
  {
    id: "prog-dental-deg",
    code: "1111404",
    name: "Bachelor of Dental Surgery (BDS)",
    level: "Degree",
    category: "Health Sciences",
    clusterNumber: 9,
    clusterGroupName: "KUCCPS Cluster 9: Medicine, Pharmacy, Nursing & Health Sciences",
    minimumMeanGrade: "B",
    clusterSubjects: ["Biology", "Chemistry", "Mathematics or Physics", "English or Kiswahili"],
    subjectRequirements: [
      { subject: "Biology", minGrade: "B" },
      { subject: "Chemistry", minGrade: "B" },
      { subject: "Mathematics", minGrade: "C+", alternativeSubjects: ["Physics"] },
      { subject: "English", minGrade: "B", alternativeSubjects: ["Kiswahili"] }
    ],
    historicalCutoffs: { "2023/2024": 43.2, "2024/2025": 43.8 },
    institutions: [
      { institutionId: "inst-1", institutionCode: "111", institutionName: "University of Nairobi", county: "Nairobi", type: "Public University", historicalCutoffs: { "2023/2024": 43.8, "2024/2025": 44.3 } },
      { institutionId: "inst-4", institutionCode: "114", institutionName: "Moi University", county: "Uasin Gishu", type: "Public University", historicalCutoffs: { "2023/2024": 42.8, "2024/2025": 43.4 } }
    ],
    active: true,
    notes: "KMPDC statutory regulated degree for oral, maxillofacial, and dental surgeons."
  },
  {
    id: "prog-pharm-deg",
    code: "1111403",
    name: "Bachelor of Pharmacy (B.Pharm)",
    level: "Degree",
    category: "Health Sciences",
    clusterNumber: 9,
    clusterGroupName: "KUCCPS Cluster 9: Medicine, Pharmacy, Nursing & Health Sciences",
    minimumMeanGrade: "B-",
    clusterSubjects: ["Biology", "Chemistry", "Mathematics or Physics", "English or Kiswahili"],
    subjectRequirements: [
      { subject: "Chemistry", minGrade: "B-" },
      { subject: "Biology", minGrade: "B-" },
      { subject: "Mathematics", minGrade: "C+", alternativeSubjects: ["Physics"] },
      { subject: "English", minGrade: "C+", alternativeSubjects: ["Kiswahili"] }
    ],
    historicalCutoffs: { "2023/2024": 41.8, "2024/2025": 42.5 },
    institutions: [
      { institutionId: "inst-1", institutionCode: "111", institutionName: "University of Nairobi", county: "Nairobi", type: "Public University", historicalCutoffs: { "2023/2024": 43.2, "2024/2025": 43.8 } },
      { institutionId: "inst-2", institutionCode: "112", institutionName: "Kenyatta University", county: "Kiambu", type: "Public University", historicalCutoffs: { "2023/2024": 42, "2024/2025": 42.6 } },
      { institutionId: "inst-3", institutionCode: "113", institutionName: "Jomo Kenyatta University of Agriculture and Technology", county: "Kiambu", type: "Public University", historicalCutoffs: { "2023/2024": 41.5, "2024/2025": 42.2 } },
      { institutionId: "inst-40", institutionCode: "140", institutionName: "Mount Kenya University", county: "Kiambu", type: "Private University", historicalCutoffs: { "2023/2024": 38, "2024/2025": 38.5 } }
    ],
    active: true,
    notes: "Pharmacy and Poisons Board (PPB) professional programme for pharmacologists and drug dispensers."
  },
  {
    id: "prog-nursing-deg",
    code: "1111402",
    name: "Bachelor of Science in Nursing",
    level: "Degree",
    category: "Health Sciences",
    clusterNumber: 9,
    clusterGroupName: "KUCCPS Cluster 9: Medicine, Pharmacy, Nursing & Health Sciences",
    minimumMeanGrade: "C+",
    clusterSubjects: ["Biology", "Chemistry", "Mathematics or Physics", "English or Kiswahili"],
    subjectRequirements: [
      { subject: "Biology", minGrade: "C+" },
      { subject: "Chemistry", minGrade: "C+" },
      { subject: "Mathematics", minGrade: "C", alternativeSubjects: ["Physics"] },
      { subject: "English", minGrade: "C+", alternativeSubjects: ["Kiswahili"] }
    ],
    historicalCutoffs: { "2023/2024": 40.2, "2024/2025": 40.8 },
    institutions: [
      { institutionId: "inst-1", institutionCode: "111", institutionName: "University of Nairobi", county: "Nairobi", type: "Public University", historicalCutoffs: { "2023/2024": 41.5, "2024/2025": 42 } },
      { institutionId: "inst-2", institutionCode: "112", institutionName: "Kenyatta University", county: "Kiambu", type: "Public University", historicalCutoffs: { "2023/2024": 40.5, "2024/2025": 41.1 } },
      { institutionId: "inst-4", institutionCode: "114", institutionName: "Moi University", county: "Uasin Gishu", type: "Public University", historicalCutoffs: { "2023/2024": 39.8, "2024/2025": 40.5 } },
      { institutionId: "inst-12", institutionCode: "122", institutionName: "Chuka University", county: "Tharaka Nithi", type: "Public University", historicalCutoffs: { "2023/2024": 37, "2024/2025": 37.6 } },
      { institutionId: "inst-11", institutionCode: "121", institutionName: "Masinde Muliro University of Science and Technology", county: "Kakamega", type: "Public University", historicalCutoffs: { "2023/2024": 37.5, "2024/2025": 38.2 } },
      { institutionId: "inst-7", institutionCode: "117", institutionName: "Maseno University", county: "Kisumu", type: "Public University", historicalCutoffs: { "2023/2024": 38.2, "2024/2025": 38.9 } }
    ],
    active: true,
    notes: "Nursing Council of Kenya (NCK) accredited programme."
  },
  {
    id: "prog-medlab-deg",
    code: "1131405",
    name: "Bachelor of Science in Medical Laboratory Science",
    level: "Degree",
    category: "Health Sciences",
    clusterNumber: 9,
    clusterGroupName: "KUCCPS Cluster 9: Medicine, Pharmacy, Nursing & Health Sciences",
    minimumMeanGrade: "C+",
    clusterSubjects: ["Biology", "Chemistry", "Mathematics or Physics", "English or Kiswahili"],
    subjectRequirements: [
      { subject: "Biology", minGrade: "C+" },
      { subject: "Chemistry", minGrade: "C+" },
      { subject: "Mathematics", minGrade: "C", alternativeSubjects: ["Physics"] },
      { subject: "English", minGrade: "C", alternativeSubjects: ["Kiswahili"] }
    ],
    historicalCutoffs: { "2023/2024": 37.5, "2024/2025": 38.2 },
    institutions: [
      { institutionId: "inst-3", institutionCode: "113", institutionName: "Jomo Kenyatta University of Agriculture and Technology", county: "Kiambu", type: "Public University", historicalCutoffs: { "2023/2024": 38.5, "2024/2025": 39.2 } },
      { institutionId: "inst-2", institutionCode: "112", institutionName: "Kenyatta University", county: "Kiambu", type: "Public University", historicalCutoffs: { "2023/2024": 37.8, "2024/2025": 38.5 } },
      { institutionId: "inst-11", institutionCode: "121", institutionName: "Masinde Muliro University of Science and Technology", county: "Kakamega", type: "Public University", historicalCutoffs: { "2023/2024": 35.5, "2024/2025": 36.2 } },
      { institutionId: "inst-14", institutionCode: "124", institutionName: "Kisii University", county: "Kisii", type: "Public University", historicalCutoffs: { "2023/2024": 34, "2024/2025": 34.8 } }
    ],
    active: true,
    notes: "Accredited by the Kenya Medical Laboratory Technicians and Technologists Board (KMLTTB)."
  },
  {
    id: "prog-clinmed-deg",
    code: "1151406",
    name: "Bachelor of Science in Clinical Medicine and Community Health",
    level: "Degree",
    category: "Health Sciences",
    clusterNumber: 9,
    clusterGroupName: "KUCCPS Cluster 9: Medicine, Pharmacy, Nursing & Health Sciences",
    minimumMeanGrade: "C+",
    clusterSubjects: ["Biology", "Chemistry", "Mathematics or Physics", "English or Kiswahili"],
    subjectRequirements: [
      { subject: "Biology", minGrade: "C+" },
      { subject: "Chemistry", minGrade: "C+" },
      { subject: "English", minGrade: "C+", alternativeSubjects: ["Kiswahili"] }
    ],
    historicalCutoffs: { "2023/2024": 38.2, "2024/2025": 38.9 },
    institutions: [
      { institutionId: "inst-5", institutionCode: "115", institutionName: "Egerton University", county: "Nakuru", type: "Public University", historicalCutoffs: { "2023/2024": 38.8, "2024/2025": 39.5 } },
      { institutionId: "inst-3", institutionCode: "113", institutionName: "Jomo Kenyatta University of Agriculture and Technology", county: "Kiambu", type: "Public University", historicalCutoffs: { "2023/2024": 39, "2024/2025": 39.6 } },
      { institutionId: "inst-14", institutionCode: "124", institutionName: "Kisii University", county: "Kisii", type: "Public University", historicalCutoffs: { "2023/2024": 36.2, "2024/2025": 36.9 } },
      { institutionId: "inst-40", institutionCode: "140", institutionName: "Mount Kenya University", county: "Kiambu", type: "Private University", historicalCutoffs: { "2023/2024": 34.5, "2024/2025": 35 } }
    ],
    active: true,
    notes: "Regulated by the Clinical Officers Council (COC) of Kenya."
  },
  {
    id: "prog-pubhealth-deg",
    code: "1121408",
    name: "Bachelor of Science in Public Health",
    level: "Degree",
    category: "Health Sciences",
    clusterNumber: 9,
    clusterGroupName: "KUCCPS Cluster 9: Medicine, Pharmacy, Nursing & Health Sciences",
    minimumMeanGrade: "C+",
    clusterSubjects: ["Biology", "Chemistry", "Mathematics or Physics", "English or Kiswahili"],
    subjectRequirements: [
      { subject: "Biology", minGrade: "C+" },
      { subject: "Chemistry", minGrade: "C" },
      { subject: "Mathematics", minGrade: "C", alternativeSubjects: ["Physics"] }
    ],
    historicalCutoffs: { "2023/2024": 34.2, "2024/2025": 34.9 },
    institutions: [
      { institutionId: "inst-2", institutionCode: "112", institutionName: "Kenyatta University", county: "Kiambu", type: "Public University", historicalCutoffs: { "2023/2024": 35.2, "2024/2025": 35.9 } },
      { institutionId: "inst-7", institutionCode: "117", institutionName: "Maseno University", county: "Kisumu", type: "Public University", historicalCutoffs: { "2023/2024": 33.5, "2024/2025": 34.2 } },
      { institutionId: "inst-12", institutionCode: "122", institutionName: "Chuka University", county: "Tharaka Nithi", type: "Public University", historicalCutoffs: { "2023/2024": 32, "2024/2025": 32.8 } },
      { institutionId: "inst-16", institutionCode: "126", institutionName: "Meru University of Science and Technology", county: "Meru", type: "Public University", historicalCutoffs: { "2023/2024": 30.5, "2024/2025": 31.2 } }
    ],
    active: true,
    notes: "Focuses on epidemiology, environmental health, health promotion, disease surveillance, and community medicine."
  },
  {
    id: "prog-nutrition-deg",
    code: "1121415",
    name: "Bachelor of Science in Human Nutrition and Dietetics",
    level: "Degree",
    category: "Health Sciences",
    clusterNumber: 9,
    clusterGroupName: "KUCCPS Cluster 9: Medicine, Pharmacy, Nursing & Health Sciences",
    minimumMeanGrade: "C+",
    clusterSubjects: ["Biology", "Chemistry", "English or Kiswahili", "Mathematics or Home Science or Agriculture"],
    subjectRequirements: [
      { subject: "Biology", minGrade: "C+" },
      { subject: "Chemistry", minGrade: "C+" },
      { subject: "English", minGrade: "C", alternativeSubjects: ["Kiswahili"] }
    ],
    historicalCutoffs: { "2023/2024": 33.8, "2024/2025": 34.5 },
    institutions: [
      { institutionId: "inst-2", institutionCode: "112", institutionName: "Kenyatta University", county: "Kiambu", type: "Public University", historicalCutoffs: { "2023/2024": 34.8, "2024/2025": 35.5 } },
      { institutionId: "inst-5", institutionCode: "115", institutionName: "Egerton University", county: "Nakuru", type: "Public University", historicalCutoffs: { "2023/2024": 33.2, "2024/2025": 33.9 } },
      { institutionId: "inst-3", institutionCode: "113", institutionName: "Jomo Kenyatta University of Agriculture and Technology", county: "Kiambu", type: "Public University", historicalCutoffs: { "2023/2024": 34.2, "2024/2025": 34.9 } }
    ],
    active: true,
    notes: "Kenya Nutritionists and Dieticians Institute (KNDI) licensed degree."
  },
  {
    id: "prog-radiography-deg",
    code: "1131420",
    name: "Bachelor of Science in Medical Radiography and Imaging",
    level: "Degree",
    category: "Health Sciences",
    clusterNumber: 9,
    clusterGroupName: "KUCCPS Cluster 9: Medicine, Pharmacy, Nursing & Health Sciences",
    minimumMeanGrade: "C+",
    clusterSubjects: ["Biology", "Physics", "Chemistry", "English or Kiswahili"],
    subjectRequirements: [
      { subject: "Biology", minGrade: "C+" },
      { subject: "Physics", minGrade: "C+" },
      { subject: "Chemistry", minGrade: "C", alternativeSubjects: ["Mathematics"] }
    ],
    historicalCutoffs: { "2023/2024": 38, "2024/2025": 38.8 },
    institutions: [
      { institutionId: "inst-3", institutionCode: "113", institutionName: "Jomo Kenyatta University of Agriculture and Technology", county: "Kiambu", type: "Public University", historicalCutoffs: { "2023/2024": 38.8, "2024/2025": 39.5 } },
      { institutionId: "inst-2", institutionCode: "112", institutionName: "Kenyatta University", county: "Kiambu", type: "Public University", historicalCutoffs: { "2023/2024": 38, "2024/2025": 38.6 } }
    ],
    active: true,
    notes: "Diagnostic radiology, CT scans, MRI imaging, ultrasound, and radiation therapy."
  },
  {
    id: "prog-physio-deg",
    code: "1131425",
    name: "Bachelor of Science in Physiotherapy",
    level: "Degree",
    category: "Health Sciences",
    clusterNumber: 9,
    clusterGroupName: "KUCCPS Cluster 9: Medicine, Pharmacy, Nursing & Health Sciences",
    minimumMeanGrade: "C+",
    clusterSubjects: ["Biology", "Physics", "Mathematics or Chemistry", "English or Kiswahili"],
    subjectRequirements: [
      { subject: "Biology", minGrade: "C+" },
      { subject: "Physics", minGrade: "C" },
      { subject: "Mathematics", minGrade: "C", alternativeSubjects: ["Chemistry"] }
    ],
    historicalCutoffs: { "2023/2024": 35.5, "2024/2025": 36.2 },
    institutions: [
      { institutionId: "inst-3", institutionCode: "113", institutionName: "Jomo Kenyatta University of Agriculture and Technology", county: "Kiambu", type: "Public University", historicalCutoffs: { "2023/2024": 36.5, "2024/2025": 37.2 } },
      { institutionId: "inst-4", institutionCode: "114", institutionName: "Moi University", county: "Uasin Gishu", type: "Public University", historicalCutoffs: { "2023/2024": 35, "2024/2025": 35.8 } }
    ],
    active: true,
    notes: "Physical rehabilitation, sports injuries, musculoskeletal therapy, and neurology recovery."
  },
  {
    id: "prog-healthrecords-deg",
    code: "1121430",
    name: "Bachelor of Science in Health Records and Information Management",
    level: "Degree",
    category: "Health Sciences",
    clusterNumber: 9,
    clusterGroupName: "KUCCPS Cluster 9: Medicine, Pharmacy, Nursing & Health Sciences",
    minimumMeanGrade: "C+",
    clusterSubjects: ["Biology", "Mathematics", "English or Kiswahili", "Computer Studies or Any Science"],
    subjectRequirements: [
      { subject: "Biology", minGrade: "C" },
      { subject: "Mathematics", minGrade: "C", alternativeSubjects: ["Physics", "Computer Studies"] },
      { subject: "English", minGrade: "C", alternativeSubjects: ["Kiswahili"] }
    ],
    historicalCutoffs: { "2023/2024": 32.5, "2024/2025": 33.2 },
    institutions: [
      { institutionId: "inst-2", institutionCode: "112", institutionName: "Kenyatta University", county: "Kiambu", type: "Public University", historicalCutoffs: { "2023/2024": 33, "2024/2025": 33.7 } },
      { institutionId: "inst-3", institutionCode: "113", institutionName: "Jomo Kenyatta University of Agriculture and Technology", county: "Kiambu", type: "Public University", historicalCutoffs: { "2023/2024": 33.5, "2024/2025": 34.2 } },
      { institutionId: "inst-12", institutionCode: "122", institutionName: "Chuka University", county: "Tharaka Nithi", type: "Public University", historicalCutoffs: { "2023/2024": 30.2, "2024/2025": 31 } }
    ],
    active: true,
    notes: "Digital hospital informatics, electronic medical records (EMR), health statistics, and disease classification."
  },
  // =========================================================================
  // 5. PURE AND APPLIED SCIENCES (Cluster 10 & 11)
  // =========================================================================
  {
    id: "prog-actuarial-deg",
    code: "1111501",
    name: "Bachelor of Science in Actuarial Science",
    level: "Degree",
    category: "Pure & Applied Sciences",
    clusterNumber: 10,
    clusterGroupName: "KUCCPS Cluster 10: Actuarial Science, Statistics, Mathematics & Financial Engineering",
    minimumMeanGrade: "C+",
    clusterSubjects: ["Mathematics", "English or Kiswahili", "Physics or Chemistry", "Business Studies or Economics or Geography"],
    subjectRequirements: [
      { subject: "Mathematics", minGrade: "B-" },
      { subject: "English", minGrade: "C+", alternativeSubjects: ["Kiswahili"] }
    ],
    historicalCutoffs: { "2023/2024": 36.5, "2024/2025": 37.2 },
    institutions: [
      { institutionId: "inst-1", institutionCode: "111", institutionName: "University of Nairobi", county: "Nairobi", type: "Public University", historicalCutoffs: { "2023/2024": 38.8, "2024/2025": 39.5 } },
      { institutionId: "inst-3", institutionCode: "113", institutionName: "Jomo Kenyatta University of Agriculture and Technology", county: "Kiambu", type: "Public University", historicalCutoffs: { "2023/2024": 37.8, "2024/2025": 38.5 } },
      { institutionId: "inst-8", institutionCode: "118", institutionName: "Strathmore University", county: "Nairobi", type: "Private University", historicalCutoffs: { "2023/2024": 33.8, "2024/2025": 34.5 } },
      { institutionId: "inst-7", institutionCode: "117", institutionName: "Maseno University", county: "Kisumu", type: "Public University", historicalCutoffs: { "2023/2024": 32, "2024/2025": 32.8 } },
      { institutionId: "inst-2", institutionCode: "112", institutionName: "Kenyatta University", county: "Kiambu", type: "Public University", historicalCutoffs: { "2023/2024": 36.2, "2024/2025": 37 } }
    ],
    active: true,
    notes: "Demands superior mathematical and statistical aptitude for insurance, pension, and financial risk analytics."
  },
  {
    id: "prog-stats-deg",
    code: "1111502",
    name: "Bachelor of Science in Statistics",
    level: "Degree",
    category: "Pure & Applied Sciences",
    clusterNumber: 10,
    clusterGroupName: "KUCCPS Cluster 10: Actuarial Science, Statistics, Mathematics & Financial Engineering",
    minimumMeanGrade: "C+",
    clusterSubjects: ["Mathematics", "Physics or Chemistry", "English or Kiswahili", "Economics or Business Studies or Geography"],
    subjectRequirements: [
      { subject: "Mathematics", minGrade: "C+" }
    ],
    historicalCutoffs: { "2023/2024": 34, "2024/2025": 34.8 },
    institutions: [
      { institutionId: "inst-1", institutionCode: "111", institutionName: "University of Nairobi", county: "Nairobi", type: "Public University", historicalCutoffs: { "2023/2024": 35.5, "2024/2025": 36.2 } },
      { institutionId: "inst-2", institutionCode: "112", institutionName: "Kenyatta University", county: "Kiambu", type: "Public University", historicalCutoffs: { "2023/2024": 34.2, "2024/2025": 35 } },
      { institutionId: "inst-5", institutionCode: "115", institutionName: "Egerton University", county: "Nakuru", type: "Public University", historicalCutoffs: { "2023/2024": 32, "2024/2025": 32.8 } },
      { institutionId: "inst-7", institutionCode: "117", institutionName: "Maseno University", county: "Kisumu", type: "Public University", historicalCutoffs: { "2023/2024": 31, "2024/2025": 31.8 } }
    ],
    active: true,
    notes: "Rigorous foundation in probability, sampling, statistical modeling, econometrics, and data science."
  },
  {
    id: "prog-math-deg",
    code: "1111508",
    name: "Bachelor of Science in Mathematics",
    level: "Degree",
    category: "Pure & Applied Sciences",
    clusterNumber: 10,
    clusterGroupName: "KUCCPS Cluster 10: Actuarial Science, Statistics, Mathematics & Financial Engineering",
    minimumMeanGrade: "C+",
    clusterSubjects: ["Mathematics", "Physics", "Chemistry", "English or Kiswahili"],
    subjectRequirements: [
      { subject: "Mathematics", minGrade: "C+" }
    ],
    historicalCutoffs: { "2023/2024": 32.5, "2024/2025": 33.2 },
    institutions: [
      { institutionId: "inst-1", institutionCode: "111", institutionName: "University of Nairobi", county: "Nairobi", type: "Public University", historicalCutoffs: { "2023/2024": 33.8, "2024/2025": 34.5 } },
      { institutionId: "inst-2", institutionCode: "112", institutionName: "Kenyatta University", county: "Kiambu", type: "Public University", historicalCutoffs: { "2023/2024": 32.2, "2024/2025": 33 } },
      { institutionId: "inst-4", institutionCode: "114", institutionName: "Moi University", county: "Uasin Gishu", type: "Public University", historicalCutoffs: { "2023/2024": 30.5, "2024/2025": 31.2 } }
    ],
    active: true,
    notes: "Pure mathematics, differential equations, numerical analysis, cryptography, and operations research."
  },
  {
    id: "prog-biochem-deg",
    code: "1111503",
    name: "Bachelor of Science in Biochemistry",
    level: "Degree",
    category: "Pure & Applied Sciences",
    clusterNumber: 11,
    clusterGroupName: "KUCCPS Cluster 11: Pure & Applied Sciences, Chemistry, Biology & Biotechnology",
    minimumMeanGrade: "C+",
    clusterSubjects: ["Biology", "Chemistry", "Mathematics or Physics", "English or Kiswahili"],
    subjectRequirements: [
      { subject: "Biology", minGrade: "C+" },
      { subject: "Chemistry", minGrade: "C+" },
      { subject: "Mathematics", minGrade: "C", alternativeSubjects: ["Physics"] }
    ],
    historicalCutoffs: { "2023/2024": 35.8, "2024/2025": 36.5 },
    institutions: [
      { institutionId: "inst-1", institutionCode: "111", institutionName: "University of Nairobi", county: "Nairobi", type: "Public University", historicalCutoffs: { "2023/2024": 37, "2024/2025": 37.8 } },
      { institutionId: "inst-3", institutionCode: "113", institutionName: "Jomo Kenyatta University of Agriculture and Technology", county: "Kiambu", type: "Public University", historicalCutoffs: { "2023/2024": 36.2, "2024/2025": 37 } },
      { institutionId: "inst-2", institutionCode: "112", institutionName: "Kenyatta University", county: "Kiambu", type: "Public University", historicalCutoffs: { "2023/2024": 35, "2024/2025": 35.8 } },
      { institutionId: "inst-5", institutionCode: "115", institutionName: "Egerton University", county: "Nakuru", type: "Public University", historicalCutoffs: { "2023/2024": 33.5, "2024/2025": 34.2 } }
    ],
    active: true,
    notes: "Focuses on molecular biology, enzymatic pathways, genetic engineering, drug design, and bioanalytics."
  },
  {
    id: "prog-biotech-deg",
    code: "1131504",
    name: "Bachelor of Science in Biotechnology",
    level: "Degree",
    category: "Pure & Applied Sciences",
    clusterNumber: 11,
    clusterGroupName: "KUCCPS Cluster 11: Pure & Applied Sciences, Chemistry, Biology & Biotechnology",
    minimumMeanGrade: "C+",
    clusterSubjects: ["Biology", "Chemistry", "Mathematics or Physics", "English or Kiswahili"],
    subjectRequirements: [
      { subject: "Biology", minGrade: "C+" },
      { subject: "Chemistry", minGrade: "C+" }
    ],
    historicalCutoffs: { "2023/2024": 34.8, "2024/2025": 35.5 },
    institutions: [
      { institutionId: "inst-3", institutionCode: "113", institutionName: "Jomo Kenyatta University of Agriculture and Technology", county: "Kiambu", type: "Public University", historicalCutoffs: { "2023/2024": 35.8, "2024/2025": 36.5 } },
      { institutionId: "inst-2", institutionCode: "112", institutionName: "Kenyatta University", county: "Kiambu", type: "Public University", historicalCutoffs: { "2023/2024": 34.8, "2024/2025": 35.5 } },
      { institutionId: "inst-11", institutionCode: "121", institutionName: "Masinde Muliro University of Science and Technology", county: "Kakamega", type: "Public University", historicalCutoffs: { "2023/2024": 32.2, "2024/2025": 32.9 } }
    ],
    active: true,
    notes: "DNA technology, agricultural crop improvement, biomanufacturing, vaccines, and industrial enzymes."
  },
  {
    id: "prog-microbio-deg",
    code: "1121505",
    name: "Bachelor of Science in Microbiology",
    level: "Degree",
    category: "Pure & Applied Sciences",
    clusterNumber: 11,
    clusterGroupName: "KUCCPS Cluster 11: Pure & Applied Sciences, Chemistry, Biology & Biotechnology",
    minimumMeanGrade: "C+",
    clusterSubjects: ["Biology", "Chemistry", "Mathematics or Physics", "English or Kiswahili"],
    subjectRequirements: [
      { subject: "Biology", minGrade: "C+" },
      { subject: "Chemistry", minGrade: "C" }
    ],
    historicalCutoffs: { "2023/2024": 34.5, "2024/2025": 35.2 },
    institutions: [
      { institutionId: "inst-2", institutionCode: "112", institutionName: "Kenyatta University", county: "Kiambu", type: "Public University", historicalCutoffs: { "2023/2024": 35.2, "2024/2025": 36 } },
      { institutionId: "inst-3", institutionCode: "113", institutionName: "Jomo Kenyatta University of Agriculture and Technology", county: "Kiambu", type: "Public University", historicalCutoffs: { "2023/2024": 35, "2024/2025": 35.8 } },
      { institutionId: "inst-4", institutionCode: "114", institutionName: "Moi University", county: "Uasin Gishu", type: "Public University", historicalCutoffs: { "2023/2024": 32.5, "2024/2025": 33.2 } }
    ],
    active: true,
    notes: "Microbial genetics, virology, immunology, fermentation, pathogen control, and industrial microbiology."
  },
  {
    id: "prog-indchem-deg",
    code: "1111506",
    name: "Bachelor of Science in Industrial Chemistry",
    level: "Degree",
    category: "Pure & Applied Sciences",
    clusterNumber: 11,
    clusterGroupName: "KUCCPS Cluster 11: Pure & Applied Sciences, Chemistry, Biology & Biotechnology",
    minimumMeanGrade: "C+",
    clusterSubjects: ["Chemistry", "Mathematics", "Physics", "English or Kiswahili"],
    subjectRequirements: [
      { subject: "Chemistry", minGrade: "C+" },
      { subject: "Mathematics", minGrade: "C" },
      { subject: "Physics", minGrade: "C", alternativeSubjects: ["Biology"] }
    ],
    historicalCutoffs: { "2023/2024": 35.2, "2024/2025": 35.9 },
    institutions: [
      { institutionId: "inst-1", institutionCode: "111", institutionName: "University of Nairobi", county: "Nairobi", type: "Public University", historicalCutoffs: { "2023/2024": 36.5, "2024/2025": 37.2 } },
      { institutionId: "inst-6", institutionCode: "116", institutionName: "Technical University of Kenya", county: "Nairobi", type: "Public University", historicalCutoffs: { "2023/2024": 34, "2024/2025": 34.8 } },
      { institutionId: "inst-5", institutionCode: "115", institutionName: "Egerton University", county: "Nakuru", type: "Public University", historicalCutoffs: { "2023/2024": 32.5, "2024/2025": 33.2 } }
    ],
    active: true,
    notes: "Bridges chemical sciences with manufacturing, polymer technology, petroleum, detergents, and fertilizers."
  },
  {
    id: "prog-analchem-deg",
    code: "1131507",
    name: "Bachelor of Science in Analytical Chemistry",
    level: "Degree",
    category: "Pure & Applied Sciences",
    clusterNumber: 11,
    clusterGroupName: "KUCCPS Cluster 11: Pure & Applied Sciences, Chemistry, Biology & Biotechnology",
    minimumMeanGrade: "C+",
    clusterSubjects: ["Chemistry", "Mathematics", "Physics", "English or Kiswahili"],
    subjectRequirements: [
      { subject: "Chemistry", minGrade: "C+" },
      { subject: "Mathematics", minGrade: "C" }
    ],
    historicalCutoffs: { "2023/2024": 34.2, "2024/2025": 35 },
    institutions: [
      { institutionId: "inst-3", institutionCode: "113", institutionName: "Jomo Kenyatta University of Agriculture and Technology", county: "Kiambu", type: "Public University", historicalCutoffs: { "2023/2024": 35.2, "2024/2025": 36 } },
      { institutionId: "inst-2", institutionCode: "112", institutionName: "Kenyatta University", county: "Kiambu", type: "Public University", historicalCutoffs: { "2023/2024": 34.2, "2024/2025": 35 } },
      { institutionId: "inst-7", institutionCode: "117", institutionName: "Maseno University", county: "Kisumu", type: "Public University", historicalCutoffs: { "2023/2024": 31.8, "2024/2025": 32.5 } }
    ],
    active: true,
    notes: "Chromatography, spectroscopy, quality compliance (KEBS), forensics, and pharmaceutical testing."
  },
  {
    id: "prog-physics-deg",
    code: "1111512",
    name: "Bachelor of Science in Physics / Renewable Energy",
    level: "Degree",
    category: "Pure & Applied Sciences",
    clusterNumber: 11,
    clusterGroupName: "KUCCPS Cluster 11: Pure & Applied Sciences, Chemistry, Biology & Biotechnology",
    minimumMeanGrade: "C+",
    clusterSubjects: ["Physics", "Mathematics", "Chemistry", "English or Kiswahili"],
    subjectRequirements: [
      { subject: "Physics", minGrade: "C+" },
      { subject: "Mathematics", minGrade: "C+" }
    ],
    historicalCutoffs: { "2023/2024": 33.2, "2024/2025": 34 },
    institutions: [
      { institutionId: "inst-1", institutionCode: "111", institutionName: "University of Nairobi", county: "Nairobi", type: "Public University", historicalCutoffs: { "2023/2024": 34.5, "2024/2025": 35.2 } },
      { institutionId: "inst-2", institutionCode: "112", institutionName: "Kenyatta University", county: "Kiambu", type: "Public University", historicalCutoffs: { "2023/2024": 33.2, "2024/2025": 34 } },
      { institutionId: "inst-16", institutionCode: "126", institutionName: "Meru University of Science and Technology", county: "Meru", type: "Public University", historicalCutoffs: { "2023/2024": 30.2, "2024/2025": 31 } }
    ],
    active: true,
    notes: "Solar energy, wind dynamics, geothermal physics, solid state physics, and energy storage systems."
  },
  {
    id: "prog-bsc-gen-deg",
    code: "1111515",
    name: "Bachelor of Science (General Science)",
    level: "Degree",
    category: "Pure & Applied Sciences",
    clusterNumber: 11,
    clusterGroupName: "KUCCPS Cluster 11: Pure & Applied Sciences, Chemistry, Biology & Biotechnology",
    minimumMeanGrade: "C+",
    clusterSubjects: ["Mathematics", "Physics or Chemistry", "Biology or Any Science", "English or Kiswahili"],
    subjectRequirements: [
      { subject: "Mathematics", minGrade: "C" }
    ],
    historicalCutoffs: { "2023/2024": 29.5, "2024/2025": 30.2 },
    institutions: [
      { institutionId: "inst-1", institutionCode: "111", institutionName: "University of Nairobi", county: "Nairobi", type: "Public University", historicalCutoffs: { "2023/2024": 31.2, "2024/2025": 31.9 } },
      { institutionId: "inst-2", institutionCode: "112", institutionName: "Kenyatta University", county: "Kiambu", type: "Public University", historicalCutoffs: { "2023/2024": 30.2, "2024/2025": 31 } },
      { institutionId: "inst-4", institutionCode: "114", institutionName: "Moi University", county: "Uasin Gishu", type: "Public University", historicalCutoffs: { "2023/2024": 28.8, "2024/2025": 29.5 } },
      { institutionId: "inst-5", institutionCode: "115", institutionName: "Egerton University", county: "Nakuru", type: "Public University", historicalCutoffs: { "2023/2024": 28.5, "2024/2025": 29.2 } }
    ],
    active: true,
    notes: "Broad foundational science degree offering flexible combinations in Botany, Zoology, Chemistry, and Physics."
  },
  // =========================================================================
  // 6. BUSINESS, COMMERCE, FINANCE & ECONOMICS (Cluster 2)
  // =========================================================================
  {
    id: "prog-bcom-deg",
    code: "1111601",
    name: "Bachelor of Commerce (B.Com)",
    level: "Degree",
    category: "Business & Finance",
    clusterNumber: 2,
    clusterGroupName: "KUCCPS Cluster 2: Business, Commerce & Financial Studies",
    minimumMeanGrade: "C+",
    clusterSubjects: ["Mathematics", "English or Kiswahili", "Business Studies or Economics or Geography", "Any Science or Group 3 or 4"],
    subjectRequirements: [
      { subject: "Mathematics", minGrade: "C" },
      { subject: "English", minGrade: "C", alternativeSubjects: ["Kiswahili"] }
    ],
    historicalCutoffs: { "2023/2024": 33.2, "2024/2025": 34 },
    institutions: [
      { institutionId: "inst-1", institutionCode: "111", institutionName: "University of Nairobi", county: "Nairobi", type: "Public University", historicalCutoffs: { "2023/2024": 34.8, "2024/2025": 35.5 } },
      { institutionId: "inst-2", institutionCode: "112", institutionName: "Kenyatta University", county: "Kiambu", type: "Public University", historicalCutoffs: { "2023/2024": 33.8, "2024/2025": 34.5 } },
      { institutionId: "inst-8", institutionCode: "118", institutionName: "Strathmore University", county: "Nairobi", type: "Private University", historicalCutoffs: { "2023/2024": 32.5, "2024/2025": 33.2 } },
      { institutionId: "inst-4", institutionCode: "114", institutionName: "Moi University", county: "Uasin Gishu", type: "Public University", historicalCutoffs: { "2023/2024": 30.5, "2024/2025": 31.2 } },
      { institutionId: "inst-5", institutionCode: "115", institutionName: "Egerton University", county: "Nakuru", type: "Public University", historicalCutoffs: { "2023/2024": 29.5, "2024/2025": 30.2 } },
      { institutionId: "inst-12", institutionCode: "122", institutionName: "Chuka University", county: "Tharaka Nithi", type: "Public University", historicalCutoffs: { "2023/2024": 27.5, "2024/2025": 28.2 } },
      { institutionId: "inst-14", institutionCode: "124", institutionName: "Kisii University", county: "Kisii", type: "Public University", historicalCutoffs: { "2023/2024": 26.5, "2024/2025": 27.2 } }
    ],
    active: true,
    notes: "Specializations include Accounting, Finance, Marketing, Human Resource Management, and Insurance."
  },
  {
    id: "prog-econ-deg",
    code: "1111602",
    name: "Bachelor of Economics and Statistics",
    level: "Degree",
    category: "Business & Finance",
    clusterNumber: 2,
    clusterGroupName: "KUCCPS Cluster 2: Business, Commerce & Financial Studies",
    minimumMeanGrade: "C+",
    clusterSubjects: ["Mathematics", "English or Kiswahili", "Economics or Business Studies", "Any Group 2 or 3 or 4"],
    subjectRequirements: [
      { subject: "Mathematics", minGrade: "C+" },
      { subject: "English", minGrade: "C", alternativeSubjects: ["Kiswahili"] }
    ],
    historicalCutoffs: { "2023/2024": 35.5, "2024/2025": 36.2 },
    institutions: [
      { institutionId: "inst-1", institutionCode: "111", institutionName: "University of Nairobi", county: "Nairobi", type: "Public University", historicalCutoffs: { "2023/2024": 36.8, "2024/2025": 37.5 } },
      { institutionId: "inst-2", institutionCode: "112", institutionName: "Kenyatta University", county: "Kiambu", type: "Public University", historicalCutoffs: { "2023/2024": 35.2, "2024/2025": 36 } },
      { institutionId: "inst-7", institutionCode: "117", institutionName: "Maseno University", county: "Kisumu", type: "Public University", historicalCutoffs: { "2023/2024": 32.8, "2024/2025": 33.5 } },
      { institutionId: "inst-14", institutionCode: "124", institutionName: "Kisii University", county: "Kisii", type: "Public University", historicalCutoffs: { "2023/2024": 30.5, "2024/2025": 31.2 } }
    ],
    active: true,
    notes: "Analytical degree integrating microeconomics, macroeconomics, econometrics, and quantitative analysis."
  },
  {
    id: "prog-econ-fin-deg",
    code: "1121605",
    name: "Bachelor of Economics and Finance",
    level: "Degree",
    category: "Business & Finance",
    clusterNumber: 2,
    clusterGroupName: "KUCCPS Cluster 2: Business, Commerce & Financial Studies",
    minimumMeanGrade: "C+",
    clusterSubjects: ["Mathematics", "English or Kiswahili", "Economics or Business Studies", "Any Group 2 or 3 or 4"],
    subjectRequirements: [
      { subject: "Mathematics", minGrade: "C+" },
      { subject: "English", minGrade: "C", alternativeSubjects: ["Kiswahili"] }
    ],
    historicalCutoffs: { "2023/2024": 35, "2024/2025": 35.8 },
    institutions: [
      { institutionId: "inst-2", institutionCode: "112", institutionName: "Kenyatta University", county: "Kiambu", type: "Public University", historicalCutoffs: { "2023/2024": 35.8, "2024/2025": 36.5 } },
      { institutionId: "inst-8", institutionCode: "118", institutionName: "Strathmore University", county: "Nairobi", type: "Private University", historicalCutoffs: { "2023/2024": 33.8, "2024/2025": 34.5 } },
      { institutionId: "inst-7", institutionCode: "117", institutionName: "Maseno University", county: "Kisumu", type: "Public University", historicalCutoffs: { "2023/2024": 32.2, "2024/2025": 33 } }
    ],
    active: true,
    notes: "Equips graduates for central banking, investment analysis, treasury operations, and public finance."
  },
  {
    id: "prog-procure-deg",
    code: "1131603",
    name: "Bachelor of Procurement and Supply Chain Management",
    level: "Degree",
    category: "Business & Finance",
    clusterNumber: 2,
    clusterGroupName: "KUCCPS Cluster 2: Business, Commerce & Financial Studies",
    minimumMeanGrade: "C+",
    clusterSubjects: ["Mathematics", "English or Kiswahili", "Business Studies or Geography or Economics", "Any Group 2 or 3 or 4"],
    subjectRequirements: [
      { subject: "Mathematics", minGrade: "C" },
      { subject: "English", minGrade: "C", alternativeSubjects: ["Kiswahili"] }
    ],
    historicalCutoffs: { "2023/2024": 32.8, "2024/2025": 33.5 },
    institutions: [
      { institutionId: "inst-3", institutionCode: "113", institutionName: "Jomo Kenyatta University of Agriculture and Technology", county: "Kiambu", type: "Public University", historicalCutoffs: { "2023/2024": 33.8, "2024/2025": 34.5 } },
      { institutionId: "inst-4", institutionCode: "114", institutionName: "Moi University", county: "Uasin Gishu", type: "Public University", historicalCutoffs: { "2023/2024": 31.8, "2024/2025": 32.5 } },
      { institutionId: "inst-13", institutionCode: "123", institutionName: "Machakos University", county: "Machakos", type: "Public University", historicalCutoffs: { "2023/2024": 29.5, "2024/2025": 30.2 } },
      { institutionId: "inst-12", institutionCode: "122", institutionName: "Chuka University", county: "Tharaka Nithi", type: "Public University", historicalCutoffs: { "2023/2024": 28.5, "2024/2025": 29.2 } }
    ],
    active: true,
    notes: "Prepares professionals for strategic logistics, inventory operations, and public procurement governance."
  },
  {
    id: "prog-busmgt-deg",
    code: "1141608",
    name: "Bachelor of Business Management (BBM)",
    level: "Degree",
    category: "Business & Finance",
    clusterNumber: 2,
    clusterGroupName: "KUCCPS Cluster 2: Business, Commerce & Financial Studies",
    minimumMeanGrade: "C+",
    clusterSubjects: ["Mathematics", "English or Kiswahili", "Business Studies or Economics or Geography", "Any Group 2 or 3 or 4"],
    subjectRequirements: [
      { subject: "Mathematics", minGrade: "C" },
      { subject: "English", minGrade: "C", alternativeSubjects: ["Kiswahili"] }
    ],
    historicalCutoffs: { "2023/2024": 31.5, "2024/2025": 32.2 },
    institutions: [
      { institutionId: "inst-4", institutionCode: "114", institutionName: "Moi University", county: "Uasin Gishu", type: "Public University", historicalCutoffs: { "2023/2024": 32.2, "2024/2025": 33 } },
      { institutionId: "inst-7", institutionCode: "117", institutionName: "Maseno University", county: "Kisumu", type: "Public University", historicalCutoffs: { "2023/2024": 31.2, "2024/2025": 32 } },
      { institutionId: "inst-12", institutionCode: "122", institutionName: "Chuka University", county: "Tharaka Nithi", type: "Public University", historicalCutoffs: { "2023/2024": 28.8, "2024/2025": 29.5 } }
    ],
    active: true,
    notes: "Broad corporate leadership, organizational dynamics, marketing, and business administration."
  },
  {
    id: "prog-hrm-deg",
    code: "1141612",
    name: "Bachelor of Human Resource Management",
    level: "Degree",
    category: "Business & Finance",
    clusterNumber: 2,
    clusterGroupName: "KUCCPS Cluster 2: Business, Commerce & Financial Studies",
    minimumMeanGrade: "C+",
    clusterSubjects: ["English or Kiswahili", "Business Studies or Economics", "Mathematics or Any Science", "Any Group 3 or 4"],
    subjectRequirements: [
      { subject: "English", minGrade: "C", alternativeSubjects: ["Kiswahili"] },
      { subject: "Mathematics", minGrade: "C-" }
    ],
    historicalCutoffs: { "2023/2024": 30.5, "2024/2025": 31.2 },
    institutions: [
      { institutionId: "inst-4", institutionCode: "114", institutionName: "Moi University", county: "Uasin Gishu", type: "Public University", historicalCutoffs: { "2023/2024": 31.2, "2024/2025": 32 } },
      { institutionId: "inst-2", institutionCode: "112", institutionName: "Kenyatta University", county: "Kiambu", type: "Public University", historicalCutoffs: { "2023/2024": 31.8, "2024/2025": 32.5 } },
      { institutionId: "inst-13", institutionCode: "123", institutionName: "Machakos University", county: "Machakos", type: "Public University", historicalCutoffs: { "2023/2024": 28.8, "2024/2025": 29.5 } }
    ],
    active: true,
    notes: "IHRM certified programme covering talent management, labor law, workplace wellness, and performance metrics."
  },
  {
    id: "prog-projmgt-deg",
    code: "1111618",
    name: "Bachelor of Project Planning and Management",
    level: "Degree",
    category: "Business & Finance",
    clusterNumber: 2,
    clusterGroupName: "KUCCPS Cluster 2: Business, Commerce & Financial Studies",
    minimumMeanGrade: "C+",
    clusterSubjects: ["Mathematics", "English or Kiswahili", "Business Studies or Economics or Geography", "Any Group 2 or 3 or 4"],
    subjectRequirements: [
      { subject: "Mathematics", minGrade: "C" },
      { subject: "English", minGrade: "C", alternativeSubjects: ["Kiswahili"] }
    ],
    historicalCutoffs: { "2023/2024": 32, "2024/2025": 32.8 },
    institutions: [
      { institutionId: "inst-1", institutionCode: "111", institutionName: "University of Nairobi", county: "Nairobi", type: "Public University", historicalCutoffs: { "2023/2024": 33.5, "2024/2025": 34.2 } },
      { institutionId: "inst-4", institutionCode: "114", institutionName: "Moi University", county: "Uasin Gishu", type: "Public University", historicalCutoffs: { "2023/2024": 31, "2024/2025": 31.8 } }
    ],
    active: true,
    notes: "Project monitoring & evaluation (M&E), donor funding management, agile project management, and risk analysis."
  },
  {
    id: "prog-fineng-deg",
    code: "1181622",
    name: "Bachelor of Science in Financial Engineering",
    level: "Degree",
    category: "Business & Finance",
    clusterNumber: 10,
    clusterGroupName: "KUCCPS Cluster 10: Actuarial Science, Statistics, Mathematics & Financial Engineering",
    minimumMeanGrade: "C+",
    clusterSubjects: ["Mathematics", "English or Kiswahili", "Physics or Chemistry", "Economics or Business Studies"],
    subjectRequirements: [
      { subject: "Mathematics", minGrade: "B" },
      { subject: "English", minGrade: "C+" }
    ],
    historicalCutoffs: { "2023/2024": 36.2, "2024/2025": 37 },
    institutions: [
      { institutionId: "inst-8", institutionCode: "118", institutionName: "Strathmore University", county: "Nairobi", type: "Private University", historicalCutoffs: { "2023/2024": 36.2, "2024/2025": 37 } },
      { institutionId: "inst-3", institutionCode: "113", institutionName: "Jomo Kenyatta University of Agriculture and Technology", county: "Kiambu", type: "Public University", historicalCutoffs: { "2023/2024": 37, "2024/2025": 37.8 } }
    ],
    active: true,
    notes: "Quantitative financial modeling, algorithmic trading, derivative securities, and fintech analytics."
  },
  // =========================================================================
  // 7. AGRICULTURE & ENVIRONMENTAL SCIENCES (Cluster 8 & 4)
  // =========================================================================
  {
    id: "prog-agribus-deg",
    code: "1151701",
    name: "Bachelor of Science in Agribusiness Management",
    level: "Degree",
    category: "Agriculture & Environment",
    clusterNumber: 8,
    clusterGroupName: "KUCCPS Cluster 8: Agribusiness, Agricultural Economics & Food Marketing",
    minimumMeanGrade: "C+",
    clusterSubjects: ["Biology or Agriculture", "Chemistry", "Mathematics or Physics", "English or Kiswahili or Economics or Business Studies"],
    subjectRequirements: [
      { subject: "Biology", minGrade: "C+", alternativeSubjects: ["Agriculture"] },
      { subject: "Mathematics", minGrade: "C" }
    ],
    historicalCutoffs: { "2023/2024": 31.8, "2024/2025": 32.5 },
    institutions: [
      { institutionId: "inst-5", institutionCode: "115", institutionName: "Egerton University", county: "Nakuru", type: "Public University", historicalCutoffs: { "2023/2024": 32.5, "2024/2025": 33.2 } },
      { institutionId: "inst-3", institutionCode: "113", institutionName: "Jomo Kenyatta University of Agriculture and Technology", county: "Kiambu", type: "Public University", historicalCutoffs: { "2023/2024": 33, "2024/2025": 33.8 } },
      { institutionId: "inst-12", institutionCode: "122", institutionName: "Chuka University", county: "Tharaka Nithi", type: "Public University", historicalCutoffs: { "2023/2024": 28.5, "2024/2025": 29.2 } }
    ],
    active: true,
    notes: "Combines agricultural science with financial enterprise, value chain addition, and export economics."
  },
  {
    id: "prog-agric-deg",
    code: "1151705",
    name: "Bachelor of Science in Agriculture",
    level: "Degree",
    category: "Agriculture & Environment",
    clusterNumber: 8,
    clusterGroupName: "KUCCPS Cluster 8: Agribusiness, Agricultural Economics & Food Marketing",
    minimumMeanGrade: "C+",
    clusterSubjects: ["Biology or Agriculture", "Chemistry", "Mathematics or Physics", "English or Kiswahili or Geography"],
    subjectRequirements: [
      { subject: "Biology", minGrade: "C+", alternativeSubjects: ["Agriculture"] },
      { subject: "Chemistry", minGrade: "C+" },
      { subject: "Mathematics", minGrade: "C" }
    ],
    historicalCutoffs: { "2023/2024": 30.2, "2024/2025": 31 },
    institutions: [
      { institutionId: "inst-5", institutionCode: "115", institutionName: "Egerton University", county: "Nakuru", type: "Public University", historicalCutoffs: { "2023/2024": 31, "2024/2025": 31.8 } },
      { institutionId: "inst-1", institutionCode: "111", institutionName: "University of Nairobi", county: "Nairobi", type: "Public University", historicalCutoffs: { "2023/2024": 32.2, "2024/2025": 33 } },
      { institutionId: "inst-12", institutionCode: "122", institutionName: "Chuka University", county: "Tharaka Nithi", type: "Public University", historicalCutoffs: { "2023/2024": 28, "2024/2025": 28.8 } }
    ],
    active: true,
    notes: "Crop agronomy, soil science, plant breeding, farm management, and post-harvest technology."
  },
  {
    id: "prog-foodsci-deg",
    code: "1131702",
    name: "Bachelor of Science in Food Science and Technology",
    level: "Degree",
    category: "Agriculture & Environment",
    clusterNumber: 8,
    clusterGroupName: "KUCCPS Cluster 8: Agribusiness, Agricultural Economics & Food Marketing",
    minimumMeanGrade: "C+",
    clusterSubjects: ["Chemistry", "Biology or Agriculture", "Mathematics or Physics", "English or Kiswahili"],
    subjectRequirements: [
      { subject: "Chemistry", minGrade: "C+" },
      { subject: "Biology", minGrade: "C+" },
      { subject: "Mathematics", minGrade: "C" }
    ],
    historicalCutoffs: { "2023/2024": 34.5, "2024/2025": 35.2 },
    institutions: [
      { institutionId: "inst-3", institutionCode: "113", institutionName: "Jomo Kenyatta University of Agriculture and Technology", county: "Kiambu", type: "Public University", historicalCutoffs: { "2023/2024": 35.5, "2024/2025": 36.2 } },
      { institutionId: "inst-5", institutionCode: "115", institutionName: "Egerton University", county: "Nakuru", type: "Public University", historicalCutoffs: { "2023/2024": 33.8, "2024/2025": 34.5 } },
      { institutionId: "inst-1", institutionCode: "111", institutionName: "University of Nairobi", county: "Nairobi", type: "Public University", historicalCutoffs: { "2023/2024": 35, "2024/2025": 35.8 } }
    ],
    active: true,
    notes: "Focuses on food processing, preservation, quality assurance (KEBS standards), and post-harvest technology."
  },
  {
    id: "prog-vetmed-deg",
    code: "1111703",
    name: "Bachelor of Veterinary Medicine (BVM)",
    level: "Degree",
    category: "Agriculture & Environment",
    clusterNumber: 9,
    clusterGroupName: "KUCCPS Cluster 9: Medicine, Pharmacy, Nursing & Health Sciences",
    minimumMeanGrade: "C+",
    clusterSubjects: ["Biology", "Chemistry", "Mathematics or Physics", "English or Kiswahili"],
    subjectRequirements: [
      { subject: "Biology", minGrade: "C+" },
      { subject: "Chemistry", minGrade: "C+" },
      { subject: "Mathematics", minGrade: "C" }
    ],
    historicalCutoffs: { "2023/2024": 37.5, "2024/2025": 38.2 },
    institutions: [
      { institutionId: "inst-1", institutionCode: "111", institutionName: "University of Nairobi", county: "Nairobi", type: "Public University", historicalCutoffs: { "2023/2024": 38.2, "2024/2025": 38.9 } },
      { institutionId: "inst-5", institutionCode: "115", institutionName: "Egerton University", county: "Nakuru", type: "Public University", historicalCutoffs: { "2023/2024": 36.8, "2024/2025": 37.5 } }
    ],
    active: true,
    notes: "Kenya Veterinary Board (KVB) regulated degree for veterinary surgeons and animal clinicians."
  },
  {
    id: "prog-animalsci-deg",
    code: "1151708",
    name: "Bachelor of Science in Animal Science and Production",
    level: "Degree",
    category: "Agriculture & Environment",
    clusterNumber: 8,
    clusterGroupName: "KUCCPS Cluster 8: Agribusiness, Agricultural Economics & Food Marketing",
    minimumMeanGrade: "C+",
    clusterSubjects: ["Biology or Agriculture", "Chemistry", "Mathematics or Physics", "English or Kiswahili"],
    subjectRequirements: [
      { subject: "Biology", minGrade: "C+", alternativeSubjects: ["Agriculture"] },
      { subject: "Chemistry", minGrade: "C" }
    ],
    historicalCutoffs: { "2023/2024": 30.5, "2024/2025": 31.2 },
    institutions: [
      { institutionId: "inst-5", institutionCode: "115", institutionName: "Egerton University", county: "Nakuru", type: "Public University", historicalCutoffs: { "2023/2024": 31.2, "2024/2025": 32 } },
      { institutionId: "inst-3", institutionCode: "113", institutionName: "Jomo Kenyatta University of Agriculture and Technology", county: "Kiambu", type: "Public University", historicalCutoffs: { "2023/2024": 32, "2024/2025": 32.8 } },
      { institutionId: "inst-12", institutionCode: "122", institutionName: "Chuka University", county: "Tharaka Nithi", type: "Public University", historicalCutoffs: { "2023/2024": 28.2, "2024/2025": 29 } }
    ],
    active: true,
    notes: "Livestock breeding, animal nutrition, dairy technology, and poultry production."
  },
  {
    id: "prog-horticulture-deg",
    code: "1131712",
    name: "Bachelor of Science in Horticulture",
    level: "Degree",
    category: "Agriculture & Environment",
    clusterNumber: 8,
    clusterGroupName: "KUCCPS Cluster 8: Agribusiness, Agricultural Economics & Food Marketing",
    minimumMeanGrade: "C+",
    clusterSubjects: ["Biology or Agriculture", "Chemistry", "Mathematics or Physics", "English or Kiswahili"],
    subjectRequirements: [
      { subject: "Biology", minGrade: "C+", alternativeSubjects: ["Agriculture"] },
      { subject: "Chemistry", minGrade: "C" }
    ],
    historicalCutoffs: { "2023/2024": 29.8, "2024/2025": 30.5 },
    institutions: [
      { institutionId: "inst-3", institutionCode: "113", institutionName: "Jomo Kenyatta University of Agriculture and Technology", county: "Kiambu", type: "Public University", historicalCutoffs: { "2023/2024": 30.8, "2024/2025": 31.5 } },
      { institutionId: "inst-5", institutionCode: "115", institutionName: "Egerton University", county: "Nakuru", type: "Public University", historicalCutoffs: { "2023/2024": 30, "2024/2025": 30.8 } }
    ],
    active: true,
    notes: "Floriculture, pomology (fruits), olericulture (vegetables), and greenhouse export farming."
  },
  {
    id: "prog-envsci-deg",
    code: "1121704",
    name: "Bachelor of Environmental Science",
    level: "Degree",
    category: "Agriculture & Environment",
    clusterNumber: 4,
    clusterGroupName: "KUCCPS Cluster 4: Geosciences, Environmental Sciences & Natural Resources",
    minimumMeanGrade: "C+",
    clusterSubjects: ["Geography or Biology", "Chemistry or Physics", "Mathematics", "Any 4th Subject"],
    subjectRequirements: [
      { subject: "Biology", minGrade: "C+", alternativeSubjects: ["Geography", "Agriculture", "Chemistry"] }
    ],
    historicalCutoffs: { "2023/2024": 31, "2024/2025": 31.8 },
    institutions: [
      { institutionId: "inst-2", institutionCode: "112", institutionName: "Kenyatta University", county: "Kiambu", type: "Public University", historicalCutoffs: { "2023/2024": 32, "2024/2025": 32.8 } },
      { institutionId: "inst-5", institutionCode: "115", institutionName: "Egerton University", county: "Nakuru", type: "Public University", historicalCutoffs: { "2023/2024": 30.8, "2024/2025": 31.5 } },
      { institutionId: "inst-7", institutionCode: "117", institutionName: "Maseno University", county: "Kisumu", type: "Public University", historicalCutoffs: { "2023/2024": 29.8, "2024/2025": 30.5 } }
    ],
    active: true,
    notes: "Addresses environmental impact assessment (NEMA), climate resilience, waste management, and ecology."
  },
  {
    id: "prog-naturalres-deg",
    code: "1151720",
    name: "Bachelor of Science in Natural Resources Management",
    level: "Degree",
    category: "Agriculture & Environment",
    clusterNumber: 4,
    clusterGroupName: "KUCCPS Cluster 4: Geosciences, Environmental Sciences & Natural Resources",
    minimumMeanGrade: "C+",
    clusterSubjects: ["Geography or Biology", "Chemistry or Physics", "English or Kiswahili", "Any 4th Subject"],
    subjectRequirements: [
      { subject: "Biology", minGrade: "C", alternativeSubjects: ["Geography", "Agriculture"] }
    ],
    historicalCutoffs: { "2023/2024": 29.5, "2024/2025": 30.2 },
    institutions: [
      { institutionId: "inst-5", institutionCode: "115", institutionName: "Egerton University", county: "Nakuru", type: "Public University", historicalCutoffs: { "2023/2024": 30.2, "2024/2025": 31 } },
      { institutionId: "inst-33", institutionCode: "133", institutionName: "Karatina University", county: "Nyeri", type: "Public University", historicalCutoffs: { "2023/2024": 28.5, "2024/2025": 29.2 } }
    ],
    active: true,
    notes: "Water catchments, forest conservation, carbon credits, and environmental policy."
  },
  {
    id: "prog-wildlife-deg",
    code: "1141725",
    name: "Bachelor of Science in Wildlife Enterprise and Management",
    level: "Degree",
    category: "Agriculture & Environment",
    clusterNumber: 4,
    clusterGroupName: "KUCCPS Cluster 4: Geosciences, Environmental Sciences & Natural Resources",
    minimumMeanGrade: "C+",
    clusterSubjects: ["Biology or Geography", "English or Kiswahili", "History and Government or Geography", "Any 4th Subject"],
    subjectRequirements: [
      { subject: "Biology", minGrade: "C", alternativeSubjects: ["Geography", "Agriculture"] }
    ],
    historicalCutoffs: { "2023/2024": 29, "2024/2025": 29.8 },
    institutions: [
      { institutionId: "inst-4", institutionCode: "114", institutionName: "Moi University", county: "Uasin Gishu", type: "Public University", historicalCutoffs: { "2023/2024": 29.8, "2024/2025": 30.5 } },
      { institutionId: "inst-33", institutionCode: "133", institutionName: "Karatina University", county: "Nyeri", type: "Public University", historicalCutoffs: { "2023/2024": 28, "2024/2025": 28.8 } }
    ],
    active: true,
    notes: "Kenya Wildlife Service (KWS) aligned training for game parks, wildlife conservancies, and eco-tourism."
  },
  // =========================================================================
  // 8. EDUCATION & TEACHER TRAINING (Cluster 10, 11, 12, 13)
  // =========================================================================
  {
    id: "prog-edsci-deg",
    code: "1121801",
    name: "Bachelor of Education (Science)",
    level: "Degree",
    category: "Education",
    clusterNumber: 17,
    clusterGroupName: "KUCCPS Cluster 17: Education (Science)",
    minimumMeanGrade: "C+",
    clusterSubjects: ["Mathematics or Biology", "Chemistry or Physics", "English or Kiswahili", "Any 4th Science or Math"],
    subjectRequirements: [
      { subject: "Mathematics", minGrade: "C+", alternativeSubjects: ["Physics", "Chemistry", "Biology"] }
    ],
    historicalCutoffs: { "2023/2024": 32.2, "2024/2025": 33 },
    institutions: [
      { institutionId: "inst-2", institutionCode: "112", institutionName: "Kenyatta University", county: "Kiambu", type: "Public University", historicalCutoffs: { "2023/2024": 33.5, "2024/2025": 34.2 } },
      { institutionId: "inst-5", institutionCode: "115", institutionName: "Egerton University", county: "Nakuru", type: "Public University", historicalCutoffs: { "2023/2024": 32, "2024/2025": 32.8 } },
      { institutionId: "inst-11", institutionCode: "121", institutionName: "Masinde Muliro University of Science and Technology", county: "Kakamega", type: "Public University", historicalCutoffs: { "2023/2024": 31.2, "2024/2025": 32 } },
      { institutionId: "inst-12", institutionCode: "122", institutionName: "Chuka University", county: "Tharaka Nithi", type: "Public University", historicalCutoffs: { "2023/2024": 29.5, "2024/2025": 30.2 } },
      { institutionId: "inst-7", institutionCode: "117", institutionName: "Maseno University", county: "Kisumu", type: "Public University", historicalCutoffs: { "2023/2024": 31, "2024/2025": 31.8 } },
      { institutionId: "inst-14", institutionCode: "124", institutionName: "Kisii University", county: "Kisii", type: "Public University", historicalCutoffs: { "2023/2024": 28.8, "2024/2025": 29.5 } }
    ],
    active: true,
    notes: "TSC requirement: Grade C+ in the two teaching subjects (e.g. Mathematics & Physics or Biology & Chemistry)."
  },
  {
    id: "prog-edarts-deg",
    code: "1121802",
    name: "Bachelor of Education (Arts)",
    level: "Degree",
    category: "Education",
    clusterNumber: 16,
    clusterGroupName: "KUCCPS Cluster 16: Education (Arts)",
    minimumMeanGrade: "C+",
    clusterSubjects: ["English", "Kiswahili", "History and Government or Geography or CRE", "Mathematics or Any Science or Business"],
    subjectRequirements: [
      { subject: "English", minGrade: "C+", alternativeSubjects: ["Kiswahili"] }
    ],
    historicalCutoffs: { "2023/2024": 30.8, "2024/2025": 31.5 },
    institutions: [
      { institutionId: "inst-2", institutionCode: "112", institutionName: "Kenyatta University", county: "Kiambu", type: "Public University", historicalCutoffs: { "2023/2024": 32, "2024/2025": 32.8 } },
      { institutionId: "inst-4", institutionCode: "114", institutionName: "Moi University", county: "Uasin Gishu", type: "Public University", historicalCutoffs: { "2023/2024": 30.8, "2024/2025": 31.5 } },
      { institutionId: "inst-7", institutionCode: "117", institutionName: "Maseno University", county: "Kisumu", type: "Public University", historicalCutoffs: { "2023/2024": 30.2, "2024/2025": 31 } },
      { institutionId: "inst-14", institutionCode: "124", institutionName: "Kisii University", county: "Kisii", type: "Public University", historicalCutoffs: { "2023/2024": 28.8, "2024/2025": 29.5 } },
      { institutionId: "inst-12", institutionCode: "122", institutionName: "Chuka University", county: "Tharaka Nithi", type: "Public University", historicalCutoffs: { "2023/2024": 28.5, "2024/2025": 29.2 } }
    ],
    active: true,
    notes: "Requires C+ in two humanities or language teaching subjects (e.g. English, Literature, History, CRE, Geography, Kiswahili)."
  },
  {
    id: "prog-ed-ecde-deg",
    code: "1121808",
    name: "Bachelor of Education (Early Childhood Development Education - ECDE)",
    level: "Degree",
    category: "Education",
    clusterNumber: 16,
    clusterGroupName: "KUCCPS Cluster 16: Education (Arts)",
    minimumMeanGrade: "C+",
    clusterSubjects: ["English or Kiswahili", "Mathematics or Biology", "History and Government or CRE or Geography", "Any 4th Subject"],
    subjectRequirements: [
      { subject: "English", minGrade: "C", alternativeSubjects: ["Kiswahili"] }
    ],
    historicalCutoffs: { "2023/2024": 28.5, "2024/2025": 29.2 },
    institutions: [
      { institutionId: "inst-2", institutionCode: "112", institutionName: "Kenyatta University", county: "Kiambu", type: "Public University", historicalCutoffs: { "2023/2024": 29.8, "2024/2025": 30.5 } },
      { institutionId: "inst-4", institutionCode: "114", institutionName: "Moi University", county: "Uasin Gishu", type: "Public University", historicalCutoffs: { "2023/2024": 28.8, "2024/2025": 29.5 } },
      { institutionId: "inst-14", institutionCode: "124", institutionName: "Kisii University", county: "Kisii", type: "Public University", historicalCutoffs: { "2023/2024": 27.5, "2024/2025": 28.2 } }
    ],
    active: true,
    notes: "Specialist qualification for child development, pre-primary curriculum, and early education management."
  },
  {
    id: "prog-ed-special-deg",
    code: "1121810",
    name: "Bachelor of Education (Special Needs Education)",
    level: "Degree",
    category: "Education",
    clusterNumber: 16,
    clusterGroupName: "KUCCPS Cluster 16: Education (Arts)",
    minimumMeanGrade: "C+",
    clusterSubjects: ["English or Kiswahili", "Biology or Mathematics", "History and Government or CRE or Geography", "Any 4th Subject"],
    subjectRequirements: [
      { subject: "English", minGrade: "C", alternativeSubjects: ["Kiswahili"] }
    ],
    historicalCutoffs: { "2023/2024": 29.2, "2024/2025": 30 },
    institutions: [
      { institutionId: "inst-2", institutionCode: "112", institutionName: "Kenyatta University", county: "Kiambu", type: "Public University", historicalCutoffs: { "2023/2024": 30.2, "2024/2025": 31 } },
      { institutionId: "inst-7", institutionCode: "117", institutionName: "Maseno University", county: "Kisumu", type: "Public University", historicalCutoffs: { "2023/2024": 29, "2024/2025": 29.8 } }
    ],
    active: true,
    notes: "Focuses on inclusive education, hearing impairment, visual impairment, autism, and assistive learning technologies."
  },
  {
    id: "prog-aged-deg",
    code: "1151815",
    name: "Bachelor of Science in Agricultural Education and Extension (AGED)",
    level: "Degree",
    category: "Education",
    clusterNumber: 17,
    clusterGroupName: "KUCCPS Cluster 17: Education (Science)",
    minimumMeanGrade: "C+",
    clusterSubjects: ["Biology or Agriculture", "Chemistry", "Mathematics or Physics", "English or Kiswahili"],
    subjectRequirements: [
      { subject: "Biology", minGrade: "C+", alternativeSubjects: ["Agriculture"] },
      { subject: "Agriculture", minGrade: "C+", alternativeSubjects: ["Biology"] }
    ],
    historicalCutoffs: { "2023/2024": 29.5, "2024/2025": 30.2 },
    institutions: [
      { institutionId: "inst-5", institutionCode: "115", institutionName: "Egerton University", county: "Nakuru", type: "Public University", historicalCutoffs: { "2023/2024": 30.5, "2024/2025": 31.2 } },
      { institutionId: "inst-12", institutionCode: "122", institutionName: "Chuka University", county: "Tharaka Nithi", type: "Public University", historicalCutoffs: { "2023/2024": 28.8, "2024/2025": 29.5 } },
      { institutionId: "inst-31", institutionCode: "131", institutionName: "University of Eldoret", county: "Uasin Gishu", type: "Public University", historicalCutoffs: { "2023/2024": 28.2, "2024/2025": 29 } }
    ],
    active: true,
    notes: "Qualifies graduates to teach Agriculture and Biology in secondary schools, or work as county agricultural extension officers."
  },
  // =========================================================================
  // 9. LAW, MEDIA, SOCIAL SCIENCES & GOVERNANCE (Cluster 1, 3, 13)
  // =========================================================================
  {
    id: "prog-law-deg",
    code: "1111901",
    name: "Bachelor of Laws (LL.B)",
    level: "Degree",
    category: "Law & Governance",
    clusterNumber: 1,
    clusterGroupName: "KUCCPS Cluster 1: Law & Legal Studies",
    minimumMeanGrade: "C+",
    clusterSubjects: ["English or Kiswahili", "History and Government", "Mathematics or Any Science", "Any Humanities or Group 4"],
    subjectRequirements: [
      { subject: "English", minGrade: "B", alternativeSubjects: ["Kiswahili"] }
    ],
    historicalCutoffs: { "2023/2024": 41.8, "2024/2025": 42.5 },
    institutions: [
      { institutionId: "inst-1", institutionCode: "111", institutionName: "University of Nairobi", county: "Nairobi", type: "Public University", historicalCutoffs: { "2023/2024": 42.8, "2024/2025": 43.5 } },
      { institutionId: "inst-2", institutionCode: "112", institutionName: "Kenyatta University", county: "Kiambu", type: "Public University", historicalCutoffs: { "2023/2024": 41.5, "2024/2025": 42.2 } },
      { institutionId: "inst-4", institutionCode: "114", institutionName: "Moi University", county: "Uasin Gishu", type: "Public University", historicalCutoffs: { "2023/2024": 38.5, "2024/2025": 39.2 } },
      { institutionId: "inst-8", institutionCode: "118", institutionName: "Strathmore University", county: "Nairobi", type: "Private University", historicalCutoffs: { "2023/2024": 38, "2024/2025": 38.8 } },
      { institutionId: "inst-41", institutionCode: "141", institutionName: "Kabarak University", county: "Nakuru", type: "Private University", historicalCutoffs: { "2023/2024": 35.5, "2024/2025": 36.2 } },
      { institutionId: "inst-42", institutionCode: "142", institutionName: "Catholic University of Eastern Africa", county: "Nairobi", type: "Private University", historicalCutoffs: { "2023/2024": 34.8, "2024/2025": 35.5 } }
    ],
    active: true,
    notes: "Council of Legal Education (CLE) statutory prerequisite: Minimum B in English or Kiswahili."
  },
  {
    id: "prog-journalism-deg",
    code: "1111902",
    name: "Bachelor of Arts in Journalism and Mass Communication",
    level: "Degree",
    category: "Law & Governance",
    clusterNumber: 13,
    clusterGroupName: "KUCCPS Cluster 13: Media, Journalism & Mass Communication",
    minimumMeanGrade: "C+",
    clusterSubjects: ["English", "Kiswahili", "History and Government or Geography", "Any 4th Subject"],
    subjectRequirements: [
      { subject: "English", minGrade: "C+", alternativeSubjects: ["Kiswahili"] }
    ],
    historicalCutoffs: { "2023/2024": 34.5, "2024/2025": 35.2 },
    institutions: [
      { institutionId: "inst-1", institutionCode: "111", institutionName: "University of Nairobi", county: "Nairobi", type: "Public University", historicalCutoffs: { "2023/2024": 35.8, "2024/2025": 36.5 } },
      { institutionId: "inst-9", institutionCode: "119", institutionName: "Multimedia University of Kenya", county: "Nairobi", type: "Public University", historicalCutoffs: { "2023/2024": 34.2, "2024/2025": 35 } },
      { institutionId: "inst-17", institutionCode: "127", institutionName: "Daystar University", county: "Machakos", type: "Private University", historicalCutoffs: { "2023/2024": 31.8, "2024/2025": 32.5 } },
      { institutionId: "inst-4", institutionCode: "114", institutionName: "Moi University", county: "Uasin Gishu", type: "Public University", historicalCutoffs: { "2023/2024": 32.5, "2024/2025": 33.2 } }
    ],
    active: true,
    notes: "Focuses on broadcast journalism, investigative reporting, digital news media, and PR."
  },
  {
    id: "prog-crim-deg",
    code: "1121903",
    name: "Bachelor of Arts in Criminology and Security Studies",
    level: "Degree",
    category: "Law & Governance",
    clusterNumber: 3,
    clusterGroupName: "KUCCPS Cluster 3: Social Sciences, Arts & Humanities",
    minimumMeanGrade: "C+",
    clusterSubjects: ["English or Kiswahili", "History and Government or Geography", "Any Humanities or Group 4", "Any 4th Subject"],
    subjectRequirements: [
      { subject: "English", minGrade: "C", alternativeSubjects: ["Kiswahili"] }
    ],
    historicalCutoffs: { "2023/2024": 32.5, "2024/2025": 33.2 },
    institutions: [
      { institutionId: "inst-2", institutionCode: "112", institutionName: "Kenyatta University", county: "Kiambu", type: "Public University", historicalCutoffs: { "2023/2024": 33.5, "2024/2025": 34.2 } },
      { institutionId: "inst-10", institutionCode: "120", institutionName: "Dedan Kimathi University of Technology", county: "Nyeri", type: "Public University", historicalCutoffs: { "2023/2024": 32, "2024/2025": 32.8 } },
      { institutionId: "inst-11", institutionCode: "121", institutionName: "Masinde Muliro University of Science and Technology", county: "Kakamega", type: "Public University", historicalCutoffs: { "2023/2024": 30.8, "2024/2025": 31.5 } },
      { institutionId: "inst-14", institutionCode: "124", institutionName: "Kisii University", county: "Kisii", type: "Public University", historicalCutoffs: { "2023/2024": 29.5, "2024/2025": 30.2 } }
    ],
    active: true,
    notes: "Covers forensic investigation, security intelligence, criminal law, and correctional management."
  },
  {
    id: "prog-intlrel-deg",
    code: "1111908",
    name: "Bachelor of Arts in International Relations and Diplomacy",
    level: "Degree",
    category: "Law & Governance",
    clusterNumber: 3,
    clusterGroupName: "KUCCPS Cluster 3: Social Sciences, Arts & Humanities",
    minimumMeanGrade: "C+",
    clusterSubjects: ["English", "Kiswahili", "History and Government or Geography", "Any 4th Subject"],
    subjectRequirements: [
      { subject: "English", minGrade: "C+", alternativeSubjects: ["Kiswahili"] },
      { subject: "History and Government", minGrade: "C", alternativeSubjects: ["Geography", "CRE (Christian Religious Education)"] }
    ],
    historicalCutoffs: { "2023/2024": 34, "2024/2025": 34.8 },
    institutions: [
      { institutionId: "inst-1", institutionCode: "111", institutionName: "University of Nairobi", county: "Nairobi", type: "Public University", historicalCutoffs: { "2023/2024": 35.8, "2024/2025": 36.5 } },
      { institutionId: "inst-18", institutionCode: "128", institutionName: "United States International University Africa", county: "Nairobi", type: "Private University", historicalCutoffs: { "2023/2024": 32.5, "2024/2025": 33.2 } },
      { institutionId: "inst-17", institutionCode: "127", institutionName: "Daystar University", county: "Machakos", type: "Private University", historicalCutoffs: { "2023/2024": 31, "2024/2025": 31.8 } }
    ],
    active: true,
    notes: "Global diplomacy, foreign policy analysis, international treaties, peace mediation, and UN operations."
  },
  {
    id: "prog-polsci-deg",
    code: "1111912",
    name: "Bachelor of Arts in Political Science and Public Administration",
    level: "Degree",
    category: "Law & Governance",
    clusterNumber: 3,
    clusterGroupName: "KUCCPS Cluster 3: Social Sciences, Arts & Humanities",
    minimumMeanGrade: "C+",
    clusterSubjects: ["English", "Kiswahili", "History and Government", "Any 4th Subject"],
    subjectRequirements: [
      { subject: "English", minGrade: "C", alternativeSubjects: ["Kiswahili"] },
      { subject: "History and Government", minGrade: "C", alternativeSubjects: ["Geography", "CRE (Christian Religious Education)"] }
    ],
    historicalCutoffs: { "2023/2024": 31.5, "2024/2025": 32.2 },
    institutions: [
      { institutionId: "inst-1", institutionCode: "111", institutionName: "University of Nairobi", county: "Nairobi", type: "Public University", historicalCutoffs: { "2023/2024": 33, "2024/2025": 33.8 } },
      { institutionId: "inst-4", institutionCode: "114", institutionName: "Moi University", county: "Uasin Gishu", type: "Public University", historicalCutoffs: { "2023/2024": 30.5, "2024/2025": 31.2 } },
      { institutionId: "inst-7", institutionCode: "117", institutionName: "Maseno University", county: "Kisumu", type: "Public University", historicalCutoffs: { "2023/2024": 29.8, "2024/2025": 30.5 } }
    ],
    active: true,
    notes: "Public policy making, civil service management, devolution governance, and constitutional democracy."
  },
  // =========================================================================
  // 10. HOSPITALITY, CREATIVE ARTS & HUMANITIES (Cluster 3, 12, 14, 15, 17, 20)
  // =========================================================================
  {
    id: "prog-hosp-deg",
    code: "1121950",
    name: "Bachelor of Science in Hospitality Management",
    level: "Degree",
    category: "Hospitality & Creative",
    clusterNumber: 12,
    clusterGroupName: "KUCCPS Cluster 12: Hospitality, Travel & Tourism Management",
    minimumMeanGrade: "C+",
    clusterSubjects: ["English or Kiswahili", "Mathematics or Biology or Geography", "Home Science or Business Studies", "Any 4th Subject"],
    subjectRequirements: [
      { subject: "English", minGrade: "C", alternativeSubjects: ["Kiswahili"] },
      { subject: "Mathematics", minGrade: "C-", alternativeSubjects: ["Business Studies", "Home Science"] }
    ],
    historicalCutoffs: { "2023/2024": 31.5, "2024/2025": 32.2 },
    institutions: [
      { institutionId: "inst-2", institutionCode: "112", institutionName: "Kenyatta University", county: "Kiambu", type: "Public University", historicalCutoffs: { "2023/2024": 32.5, "2024/2025": 33.2 } },
      { institutionId: "inst-4", institutionCode: "114", institutionName: "Moi University", county: "Uasin Gishu", type: "Public University", historicalCutoffs: { "2023/2024": 30.8, "2024/2025": 31.5 } },
      { institutionId: "inst-15", institutionCode: "125", institutionName: "Technical University of Mombasa", county: "Mombasa", type: "Public University", historicalCutoffs: { "2023/2024": 29.5, "2024/2025": 30.2 } },
      { institutionId: "inst-13", institutionCode: "123", institutionName: "Machakos University", county: "Machakos", type: "Public University", historicalCutoffs: { "2023/2024": 28.5, "2024/2025": 29.2 } }
    ],
    active: true,
    notes: "Comprehensive management training for luxury resorts, airlines, conference centers, and food systems."
  },
  {
    id: "prog-tour-deg",
    code: "1141951",
    name: "Bachelor of Tourism Management",
    level: "Degree",
    category: "Hospitality & Creative",
    clusterNumber: 12,
    clusterGroupName: "KUCCPS Cluster 12: Hospitality, Travel & Tourism Management",
    minimumMeanGrade: "C+",
    clusterSubjects: ["English or Kiswahili", "Geography", "History and Government or Business Studies", "Any 4th Subject"],
    subjectRequirements: [
      { subject: "English", minGrade: "C", alternativeSubjects: ["Kiswahili"] },
      { subject: "Geography", minGrade: "C", alternativeSubjects: ["History and Government", "Business Studies"] }
    ],
    historicalCutoffs: { "2023/2024": 30.2, "2024/2025": 31 },
    institutions: [
      { institutionId: "inst-4", institutionCode: "114", institutionName: "Moi University", county: "Uasin Gishu", type: "Public University", historicalCutoffs: { "2023/2024": 30.5, "2024/2025": 31.2 } },
      { institutionId: "inst-2", institutionCode: "112", institutionName: "Kenyatta University", county: "Kiambu", type: "Public University", historicalCutoffs: { "2023/2024": 31.2, "2024/2025": 32 } },
      { institutionId: "inst-15", institutionCode: "125", institutionName: "Technical University of Mombasa", county: "Mombasa", type: "Public University", historicalCutoffs: { "2023/2024": 29.2, "2024/2025": 30 } },
      { institutionId: "inst-7", institutionCode: "117", institutionName: "Maseno University", county: "Kisumu", type: "Public University", historicalCutoffs: { "2023/2024": 28.5, "2024/2025": 29.2 } }
    ],
    active: true,
    notes: "Ecotourism, safari operations, national parks administration, and airline tour packaging."
  },
  {
    id: "prog-psych-deg",
    code: "1121805",
    name: "Bachelor of Psychology / Counseling Psychology",
    level: "Degree",
    category: "Education",
    clusterNumber: 3,
    clusterGroupName: "KUCCPS Cluster 3: Social Sciences, Arts & Humanities",
    minimumMeanGrade: "C+",
    clusterSubjects: ["English or Kiswahili", "Biology", "History and Government or CRE or Geography", "Any 4th Subject"],
    subjectRequirements: [
      { subject: "English", minGrade: "C", alternativeSubjects: ["Kiswahili"] },
      { subject: "Biology", minGrade: "C", alternativeSubjects: ["General Science", "Mathematics"] }
    ],
    historicalCutoffs: { "2023/2024": 30.5, "2024/2025": 31.2 },
    institutions: [
      { institutionId: "inst-2", institutionCode: "112", institutionName: "Kenyatta University", county: "Kiambu", type: "Public University", historicalCutoffs: { "2023/2024": 31.5, "2024/2025": 32.2 } },
      { institutionId: "inst-4", institutionCode: "114", institutionName: "Moi University", county: "Uasin Gishu", type: "Public University", historicalCutoffs: { "2023/2024": 30, "2024/2025": 30.8 } },
      { institutionId: "inst-17", institutionCode: "127", institutionName: "Daystar University", county: "Machakos", type: "Private University", historicalCutoffs: { "2023/2024": 28.5, "2024/2025": 29.2 } }
    ],
    active: true,
    notes: "Focuses on clinical counseling, developmental psychology, cognitive behavioral interventions, and mental health."
  },
  {
    id: "prog-socwork-deg",
    code: "1111806",
    name: "Bachelor of Arts in Social Work & Community Development",
    level: "Degree",
    category: "Education",
    clusterNumber: 3,
    clusterGroupName: "KUCCPS Cluster 3: Social Sciences, Arts & Humanities",
    minimumMeanGrade: "C+",
    clusterSubjects: ["English or Kiswahili", "History and Government or Geography or CRE", "Any Group 2 or 3", "Any 4th Subject"],
    subjectRequirements: [
      { subject: "English", minGrade: "C", alternativeSubjects: ["Kiswahili"] }
    ],
    historicalCutoffs: { "2023/2024": 29.8, "2024/2025": 30.5 },
    institutions: [
      { institutionId: "inst-1", institutionCode: "111", institutionName: "University of Nairobi", county: "Nairobi", type: "Public University", historicalCutoffs: { "2023/2024": 31, "2024/2025": 31.8 } },
      { institutionId: "inst-14", institutionCode: "124", institutionName: "Kisii University", county: "Kisii", type: "Public University", historicalCutoffs: { "2023/2024": 28.8, "2024/2025": 29.5 } },
      { institutionId: "inst-7", institutionCode: "117", institutionName: "Maseno University", county: "Kisumu", type: "Public University", historicalCutoffs: { "2023/2024": 28.5, "2024/2025": 29.2 } }
    ],
    active: true,
    notes: "Equips development practitioners for NGO management, humanitarian relief, child protection, and community welfare."
  },
  {
    id: "prog-ba-general-deg",
    code: "1111925",
    name: "Bachelor of Arts (General Humanities & Social Sciences)",
    level: "Degree",
    category: "Law & Governance",
    clusterNumber: 3,
    clusterGroupName: "KUCCPS Cluster 3: Social Sciences, Arts & Humanities",
    minimumMeanGrade: "C+",
    clusterSubjects: ["English", "Kiswahili", "History and Government or Geography or CRE", "Any 4th Subject"],
    subjectRequirements: [
      { subject: "English", minGrade: "C", alternativeSubjects: ["Kiswahili"] }
    ],
    historicalCutoffs: { "2023/2024": 27.5, "2024/2025": 28.2 },
    institutions: [
      { institutionId: "inst-1", institutionCode: "111", institutionName: "University of Nairobi", county: "Nairobi", type: "Public University", historicalCutoffs: { "2023/2024": 29.5, "2024/2025": 30.2 } },
      { institutionId: "inst-2", institutionCode: "112", institutionName: "Kenyatta University", county: "Kiambu", type: "Public University", historicalCutoffs: { "2023/2024": 28.5, "2024/2025": 29.2 } },
      { institutionId: "inst-4", institutionCode: "114", institutionName: "Moi University", county: "Uasin Gishu", type: "Public University", historicalCutoffs: { "2023/2024": 27, "2024/2025": 27.8 } },
      { institutionId: "inst-7", institutionCode: "117", institutionName: "Maseno University", county: "Kisumu", type: "Public University", historicalCutoffs: { "2023/2024": 26.5, "2024/2025": 27.2 } }
    ],
    active: true,
    notes: "Versatile liberal arts degree enabling double majors in Literature, Sociology, Philosophy, Political Science, and History."
  },
  {
    id: "prog-kisw-deg",
    code: "1121930",
    name: "Bachelor of Arts in Kiswahili and Communication",
    level: "Degree",
    category: "Law & Governance",
    clusterNumber: 3,
    clusterGroupName: "KUCCPS Cluster 3: Social Sciences, Arts & Humanities",
    minimumMeanGrade: "C+",
    clusterSubjects: ["Kiswahili", "English", "History and Government or Geography or CRE", "Any 4th Subject"],
    subjectRequirements: [
      { subject: "Kiswahili", minGrade: "C+" }
    ],
    historicalCutoffs: { "2023/2024": 28, "2024/2025": 28.8 },
    institutions: [
      { institutionId: "inst-2", institutionCode: "112", institutionName: "Kenyatta University", county: "Kiambu", type: "Public University", historicalCutoffs: { "2023/2024": 29, "2024/2025": 29.8 } },
      { institutionId: "inst-4", institutionCode: "114", institutionName: "Moi University", county: "Uasin Gishu", type: "Public University", historicalCutoffs: { "2023/2024": 28, "2024/2025": 28.8 } },
      { institutionId: "inst-12", institutionCode: "122", institutionName: "Chuka University", county: "Tharaka Nithi", type: "Public University", historicalCutoffs: { "2023/2024": 27, "2024/2025": 27.8 } }
    ],
    active: true,
    notes: "Kiswahili media translation, national broadcasting, curriculum development, and regional East African Community diplomacy."
  },
  {
    id: "prog-filmanim-deg",
    code: "1191940",
    name: "Bachelor of Arts in Film and Animation Production",
    level: "Degree",
    category: "Hospitality & Creative",
    clusterNumber: 14,
    clusterGroupName: "KUCCPS Cluster 14: Film, Animation, Theatre & Performing Arts",
    minimumMeanGrade: "C+",
    clusterSubjects: ["English or Kiswahili", "Art and Design or Computer Studies or Music", "History and Government or Geography", "Any 4th Subject"],
    subjectRequirements: [
      { subject: "English", minGrade: "C", alternativeSubjects: ["Kiswahili"] }
    ],
    historicalCutoffs: { "2023/2024": 32, "2024/2025": 32.8 },
    institutions: [
      { institutionId: "inst-9", institutionCode: "119", institutionName: "Multimedia University of Kenya", county: "Nairobi", type: "Public University", historicalCutoffs: { "2023/2024": 32.8, "2024/2025": 33.5 } },
      { institutionId: "inst-2", institutionCode: "112", institutionName: "Kenyatta University", county: "Kiambu", type: "Public University", historicalCutoffs: { "2023/2024": 32, "2024/2025": 32.8 } }
    ],
    active: true,
    notes: "Cinema directing, 3D character animation, sound engineering, visual effects (VFX), and screenwriting."
  },
  {
    id: "prog-fashion-deg",
    code: "1121945",
    name: "Bachelor of Science in Fashion Design and Marketing",
    level: "Degree",
    category: "Hospitality & Creative",
    clusterNumber: 18,
    clusterGroupName: "KUCCPS Cluster 18: Fashion Design, Clothing & Textiles",
    minimumMeanGrade: "C+",
    clusterSubjects: ["English or Kiswahili", "Home Science or Art and Design", "Chemistry or Biology", "Business Studies or Mathematics"],
    subjectRequirements: [
      { subject: "English", minGrade: "C", alternativeSubjects: ["Kiswahili"] }
    ],
    historicalCutoffs: { "2023/2024": 29.5, "2024/2025": 30.2 },
    institutions: [
      { institutionId: "inst-2", institutionCode: "112", institutionName: "Kenyatta University", county: "Kiambu", type: "Public University", historicalCutoffs: { "2023/2024": 30.5, "2024/2025": 31.2 } },
      { institutionId: "inst-5", institutionCode: "115", institutionName: "Egerton University", county: "Nakuru", type: "Public University", historicalCutoffs: { "2023/2024": 29, "2024/2025": 29.8 } }
    ],
    active: true,
    notes: "Haute couture, garment technology, textile CAD, fashion marketing, and apparel brand enterprise."
  },
  {
    id: "prog-library-deg",
    code: "1141955",
    name: "Bachelor of Science in Library and Information Science",
    level: "Degree",
    category: "Professional & Technical",
    clusterNumber: 20,
    clusterGroupName: "KUCCPS Cluster 20: Library & Information Science, Records Management",
    minimumMeanGrade: "C+",
    clusterSubjects: ["English or Kiswahili", "Mathematics or History and Government", "Computer Studies or Any Science", "Any 4th Subject"],
    subjectRequirements: [
      { subject: "English", minGrade: "C", alternativeSubjects: ["Kiswahili"] }
    ],
    historicalCutoffs: { "2023/2024": 28.5, "2024/2025": 29.2 },
    institutions: [
      { institutionId: "inst-4", institutionCode: "114", institutionName: "Moi University", county: "Uasin Gishu", type: "Public University", historicalCutoffs: { "2023/2024": 29, "2024/2025": 29.8 } },
      { institutionId: "inst-2", institutionCode: "112", institutionName: "Kenyatta University", county: "Kiambu", type: "Public University", historicalCutoffs: { "2023/2024": 29.5, "2024/2025": 30.2 } },
      { institutionId: "inst-14", institutionCode: "124", institutionName: "Kisii University", county: "Kisii", type: "Public University", historicalCutoffs: { "2023/2024": 27.8, "2024/2025": 28.5 } }
    ],
    active: true,
    notes: "Knowledge management, digital archives, corporate records governance, library automation, and data indexing."
  },
  {
    id: "prog-maritime-deg",
    code: "1131980",
    name: "Bachelor of Science in Maritime Transport and Logistics",
    level: "Degree",
    category: "Professional & Technical",
    clusterNumber: 15,
    clusterGroupName: "KUCCPS Cluster 15: Maritime Transport, Logistics & Shipping",
    minimumMeanGrade: "C+",
    clusterSubjects: ["Mathematics", "Physics or Geography", "English or Kiswahili", "Business Studies or Chemistry"],
    subjectRequirements: [
      { subject: "Mathematics", minGrade: "C+" },
      { subject: "Physics", minGrade: "C", alternativeSubjects: ["Chemistry", "Geography"] },
      { subject: "English", minGrade: "C", alternativeSubjects: ["Kiswahili"] }
    ],
    historicalCutoffs: { "2023/2024": 33.5, "2024/2025": 34.2 },
    institutions: [
      { institutionId: "inst-3", institutionCode: "113", institutionName: "Jomo Kenyatta University of Agriculture and Technology", county: "Kiambu", type: "Public University", historicalCutoffs: { "2023/2024": 34.2, "2024/2025": 35 } },
      { institutionId: "inst-15", institutionCode: "125", institutionName: "Technical University of Mombasa", county: "Mombasa", type: "Public University", historicalCutoffs: { "2023/2024": 33.2, "2024/2025": 34 } }
    ],
    active: true,
    notes: "KPA and IMO aligned programme for port operations, shipping agency management, and blue economy logistics."
  },
  {
    id: "prog-realestate-deg",
    code: "1111985",
    name: "Bachelor of Real Estate",
    level: "Degree",
    category: "Professional & Technical",
    clusterNumber: 6,
    clusterGroupName: "KUCCPS Cluster 6: Architecture, Quantity Surveying & Building Construction",
    minimumMeanGrade: "C+",
    clusterSubjects: ["Mathematics", "Economics or Business Studies", "Geography", "English or Kiswahili"],
    subjectRequirements: [
      { subject: "Mathematics", minGrade: "C" },
      { subject: "English", minGrade: "C", alternativeSubjects: ["Kiswahili"] }
    ],
    historicalCutoffs: { "2023/2024": 36.5, "2024/2025": 37.2 },
    institutions: [
      { institutionId: "inst-1", institutionCode: "111", institutionName: "University of Nairobi", county: "Nairobi", type: "Public University", historicalCutoffs: { "2023/2024": 37.8, "2024/2025": 38.5 } },
      { institutionId: "inst-6", institutionCode: "116", institutionName: "Technical University of Kenya", county: "Nairobi", type: "Public University", historicalCutoffs: { "2023/2024": 35.5, "2024/2025": 36.2 } }
    ],
    active: true,
    notes: "Institution of Surveyors of Kenya (ISK) recognized for property valuation, appraisal, and asset management."
  },
  // =========================================================================
  // 11. NATIONAL POLYTECHNIC & TVET DIPLOMAS (Minimum C-)
  // =========================================================================
  {
    id: "prog-it-dip",
    code: "2011110",
    name: "Diploma in Information Communication Technology (ICT)",
    level: "Diploma",
    category: "Computing & IT",
    clusterGroupName: "TVET / National Polytechnic Diploma Pathway",
    minimumMeanGrade: "C-",
    subjectRequirements: [
      { subject: "Mathematics", minGrade: "D+" },
      { subject: "English", minGrade: "D+", alternativeSubjects: ["Kiswahili"] }
    ],
    institutions: [
      { institutionId: "inst-19", institutionCode: "201", institutionName: "Kabete National Polytechnic", county: "Nairobi", type: "National Polytechnic" },
      { institutionId: "inst-20", institutionCode: "202", institutionName: "Nairobi Technical Training Institute", county: "Nairobi", type: "Technical College" },
      { institutionId: "inst-21", institutionCode: "203", institutionName: "Kisumu National Polytechnic", county: "Kisumu", type: "National Polytechnic" },
      { institutionId: "inst-22", institutionCode: "204", institutionName: "Kenya Coast National Polytechnic", county: "Mombasa", type: "National Polytechnic" },
      { institutionId: "inst-24", institutionCode: "206", institutionName: "Eldoret National Polytechnic", county: "Uasin Gishu", type: "National Polytechnic" }
    ],
    active: true,
    notes: "TVET Diploma. Placement is determined strictly by KCSE Mean Grade (C-) and subject prerequisites. No cluster points are used."
  },
  {
    id: "prog-eee-dip",
    code: "2011210",
    name: "Diploma in Electrical and Electronic Engineering (Power/Telecomm)",
    level: "Diploma",
    category: "Engineering",
    clusterGroupName: "TVET / National Polytechnic Diploma Pathway",
    minimumMeanGrade: "C-",
    subjectRequirements: [
      { subject: "Mathematics", minGrade: "D+" },
      { subject: "Physics", minGrade: "D+", alternativeSubjects: ["Chemistry", "Physical Sciences"] }
    ],
    institutions: [
      { institutionId: "inst-19", institutionCode: "201", institutionName: "Kabete National Polytechnic", county: "Nairobi", type: "National Polytechnic" },
      { institutionId: "inst-20", institutionCode: "202", institutionName: "Nairobi Technical Training Institute", county: "Nairobi", type: "Technical College" },
      { institutionId: "inst-21", institutionCode: "203", institutionName: "Kisumu National Polytechnic", county: "Kisumu", type: "National Polytechnic" },
      { institutionId: "inst-24", institutionCode: "206", institutionName: "Eldoret National Polytechnic", county: "Uasin Gishu", type: "National Polytechnic" },
      { institutionId: "inst-25", institutionCode: "207", institutionName: "Nyeri National Polytechnic", county: "Nyeri", type: "National Polytechnic" }
    ],
    active: true,
    notes: "TVET Diploma. Admission based on Mean Grade C- and science prerequisites."
  },
  {
    id: "prog-mech-dip",
    code: "2011220",
    name: "Diploma in Mechanical Engineering (Production/Plant)",
    level: "Diploma",
    category: "Engineering",
    clusterGroupName: "TVET / National Polytechnic Diploma Pathway",
    minimumMeanGrade: "C-",
    subjectRequirements: [
      { subject: "Mathematics", minGrade: "D+" },
      { subject: "Physics", minGrade: "D+", alternativeSubjects: ["Chemistry"] }
    ],
    institutions: [
      { institutionId: "inst-19", institutionCode: "201", institutionName: "Kabete National Polytechnic", county: "Nairobi", type: "National Polytechnic" },
      { institutionId: "inst-23", institutionCode: "205", institutionName: "Rift Valley Institute of Science and Technology", county: "Nakuru", type: "Technical College" },
      { institutionId: "inst-22", institutionCode: "204", institutionName: "Kenya Coast National Polytechnic", county: "Mombasa", type: "National Polytechnic" }
    ],
    active: true,
    notes: "Hands-on practical training in machine tools, hydraulics, and workshop maintenance."
  },
  {
    id: "prog-civil-dip",
    code: "2011230",
    name: "Diploma in Civil Engineering / Building Technology",
    level: "Diploma",
    category: "Engineering",
    clusterGroupName: "TVET / National Polytechnic Diploma Pathway",
    minimumMeanGrade: "C-",
    subjectRequirements: [
      { subject: "Mathematics", minGrade: "D+" },
      { subject: "Physics", minGrade: "D+", alternativeSubjects: ["Chemistry", "Building Construction"] }
    ],
    institutions: [
      { institutionId: "inst-19", institutionCode: "201", institutionName: "Kabete National Polytechnic", county: "Nairobi", type: "National Polytechnic" },
      { institutionId: "inst-21", institutionCode: "203", institutionName: "Kisumu National Polytechnic", county: "Kisumu", type: "National Polytechnic" },
      { institutionId: "inst-24", institutionCode: "206", institutionName: "Eldoret National Polytechnic", county: "Uasin Gishu", type: "National Polytechnic" }
    ],
    active: true,
    notes: "Prepares students for site supervision, structural drafting, and material testing."
  },
  {
    id: "prog-clinmed-dip",
    code: "2011410",
    name: "Diploma in Clinical Medicine and Surgery",
    level: "Diploma",
    category: "Health Sciences",
    clusterGroupName: "Health Sciences TVET & College Diploma Pathway",
    minimumMeanGrade: "C",
    subjectRequirements: [
      { subject: "Biology", minGrade: "C" },
      { subject: "Chemistry", minGrade: "C-" },
      { subject: "English", minGrade: "C", alternativeSubjects: ["Kiswahili"] }
    ],
    institutions: [
      { institutionId: "inst-19", institutionCode: "201", institutionName: "Kabete National Polytechnic", county: "Nairobi", type: "National Polytechnic" },
      { institutionId: "inst-21", institutionCode: "203", institutionName: "Kisumu National Polytechnic", county: "Kisumu", type: "National Polytechnic" },
      { institutionId: "inst-24", institutionCode: "206", institutionName: "Eldoret National Polytechnic", county: "Uasin Gishu", type: "National Polytechnic" }
    ],
    active: true,
    notes: "Clinical Officers Council (COC) accredited diploma leading to registered clinical officer status."
  },
  {
    id: "prog-medlab-dip",
    code: "2011420",
    name: "Diploma in Medical Laboratory Technology",
    level: "Diploma",
    category: "Health Sciences",
    clusterGroupName: "Health Sciences TVET & College Diploma Pathway",
    minimumMeanGrade: "C",
    subjectRequirements: [
      { subject: "Biology", minGrade: "C" },
      { subject: "Chemistry", minGrade: "C" },
      { subject: "English", minGrade: "C-", alternativeSubjects: ["Kiswahili"] }
    ],
    institutions: [
      { institutionId: "inst-20", institutionCode: "202", institutionName: "Nairobi Technical Training Institute", county: "Nairobi", type: "Technical College" },
      { institutionId: "inst-22", institutionCode: "204", institutionName: "Kenya Coast National Polytechnic", county: "Mombasa", type: "National Polytechnic" },
      { institutionId: "inst-23", institutionCode: "205", institutionName: "Rift Valley Institute of Science and Technology", county: "Nakuru", type: "Technical College" }
    ],
    active: true,
    notes: "Prepares diagnostic lab specialists for hospital labs, research, and clinics."
  },
  {
    id: "prog-pharm-dip",
    code: "2011430",
    name: "Diploma in Pharmacy",
    level: "Diploma",
    category: "Health Sciences",
    clusterGroupName: "Health Sciences TVET & College Diploma Pathway",
    minimumMeanGrade: "C",
    subjectRequirements: [
      { subject: "Biology", minGrade: "C" },
      { subject: "Chemistry", minGrade: "C" },
      { subject: "English", minGrade: "C", alternativeSubjects: ["Kiswahili"] }
    ],
    institutions: [
      { institutionId: "inst-19", institutionCode: "201", institutionName: "Kabete National Polytechnic", county: "Nairobi", type: "National Polytechnic" },
      { institutionId: "inst-20", institutionCode: "202", institutionName: "Nairobi Technical Training Institute", county: "Nairobi", type: "Technical College" }
    ],
    active: true,
    notes: "PPB certified pharmaceutical technologist course for hospital dispensing and community pharmacies."
  },
  {
    id: "prog-busmgt-dip",
    code: "2011610",
    name: "Diploma in Business Management",
    level: "Diploma",
    category: "Business & Finance",
    clusterGroupName: "TVET Business & Management Diploma Pathway",
    minimumMeanGrade: "C-",
    subjectRequirements: [
      { subject: "English", minGrade: "D+", alternativeSubjects: ["Kiswahili"] },
      { subject: "Mathematics", minGrade: "D" }
    ],
    institutions: [
      { institutionId: "inst-19", institutionCode: "201", institutionName: "Kabete National Polytechnic", county: "Nairobi", type: "National Polytechnic" },
      { institutionId: "inst-20", institutionCode: "202", institutionName: "Nairobi Technical Training Institute", county: "Nairobi", type: "Technical College" },
      { institutionId: "inst-21", institutionCode: "203", institutionName: "Kisumu National Polytechnic", county: "Kisumu", type: "National Polytechnic" },
      { institutionId: "inst-24", institutionCode: "206", institutionName: "Eldoret National Polytechnic", county: "Uasin Gishu", type: "National Polytechnic" }
    ],
    active: true,
    notes: "Covers office administration, marketing basics, financial accounting, and entrepreneurship."
  },
  {
    id: "prog-supply-dip",
    code: "2011620",
    name: "Diploma in Supply Chain Management",
    level: "Diploma",
    category: "Business & Finance",
    clusterGroupName: "TVET Business & Management Diploma Pathway",
    minimumMeanGrade: "C-",
    subjectRequirements: [
      { subject: "English", minGrade: "D+", alternativeSubjects: ["Kiswahili"] }
    ],
    institutions: [
      { institutionId: "inst-19", institutionCode: "201", institutionName: "Kabete National Polytechnic", county: "Nairobi", type: "National Polytechnic" },
      { institutionId: "inst-22", institutionCode: "204", institutionName: "Kenya Coast National Polytechnic", county: "Mombasa", type: "National Polytechnic" },
      { institutionId: "inst-25", institutionCode: "207", institutionName: "Nyeri National Polytechnic", county: "Nyeri", type: "National Polytechnic" }
    ],
    active: true,
    notes: "KISM and KNEC aligned curriculum for procurement, warehousing, and inventory officers."
  },
  {
    id: "prog-agric-dip",
    code: "2011710",
    name: "Diploma in General Agriculture / Sustainable Agriculture",
    level: "Diploma",
    category: "Agriculture & Environment",
    clusterGroupName: "TVET Agricultural Diploma Pathway",
    minimumMeanGrade: "C-",
    subjectRequirements: [
      { subject: "Biology", minGrade: "D+", alternativeSubjects: ["Agriculture"] },
      { subject: "Chemistry", minGrade: "D+" }
    ],
    institutions: [
      { institutionId: "inst-23", institutionCode: "205", institutionName: "Rift Valley Institute of Science and Technology", county: "Nakuru", type: "Technical College" },
      { institutionId: "inst-24", institutionCode: "206", institutionName: "Eldoret National Polytechnic", county: "Uasin Gishu", type: "National Polytechnic" },
      { institutionId: "inst-26", institutionCode: "208", institutionName: "Sigalagala National Polytechnic", county: "Kakamega", type: "National Polytechnic" }
    ],
    active: true,
    notes: "Comprehensive field training in crop management, animal husbandry, irrigation, and farm economics."
  },
  {
    id: "prog-journalism-dip",
    code: "2011910",
    name: "Diploma in Journalism and Media Studies",
    level: "Diploma",
    category: "Law & Governance",
    clusterGroupName: "TVET Media & Communication Diploma Pathway",
    minimumMeanGrade: "C-",
    subjectRequirements: [
      { subject: "English", minGrade: "C-", alternativeSubjects: ["Kiswahili"] }
    ],
    institutions: [
      { institutionId: "inst-28", institutionCode: "210", institutionName: "Kenya Institute of Mass Communication", county: "Nairobi", type: "Technical College" },
      { institutionId: "inst-22", institutionCode: "204", institutionName: "Kenya Coast National Polytechnic", county: "Mombasa", type: "National Polytechnic" },
      { institutionId: "inst-21", institutionCode: "203", institutionName: "Kisumu National Polytechnic", county: "Kisumu", type: "National Polytechnic" }
    ],
    active: true,
    notes: "Hands-on TV/Radio studio production, news writing, podcasting, and media editing."
  },
  {
    id: "prog-crim-dip",
    code: "2011920",
    name: "Diploma in Criminology and Forensic Studies",
    level: "Diploma",
    category: "Law & Governance",
    clusterGroupName: "TVET Law & Security Diploma Pathway",
    minimumMeanGrade: "C-",
    subjectRequirements: [
      { subject: "English", minGrade: "D+", alternativeSubjects: ["Kiswahili"] }
    ],
    institutions: [
      { institutionId: "inst-19", institutionCode: "201", institutionName: "Kabete National Polytechnic", county: "Nairobi", type: "National Polytechnic" },
      { institutionId: "inst-24", institutionCode: "206", institutionName: "Eldoret National Polytechnic", county: "Uasin Gishu", type: "National Polytechnic" }
    ],
    active: true,
    notes: "Prepares officers for private security management, loss prevention, and investigative support."
  },
  {
    id: "prog-hosp-dip",
    code: "2011960",
    name: "Diploma in Food and Beverage Management / Culinary Arts",
    level: "Diploma",
    category: "Hospitality & Creative",
    clusterGroupName: "TVET Hospitality Diploma Pathway",
    minimumMeanGrade: "C-",
    subjectRequirements: [
      { subject: "English", minGrade: "D+", alternativeSubjects: ["Kiswahili"] }
    ],
    institutions: [
      { institutionId: "inst-29", institutionCode: "211", institutionName: "Kenya Utalii College", county: "Nairobi", type: "Technical College" },
      { institutionId: "inst-20", institutionCode: "202", institutionName: "Nairobi Technical Training Institute", county: "Nairobi", type: "Technical College" },
      { institutionId: "inst-22", institutionCode: "204", institutionName: "Kenya Coast National Polytechnic", county: "Mombasa", type: "National Polytechnic" }
    ],
    active: true,
    notes: "Premier culinary and restaurant management qualification accredited by Utalii & TVET-CDACC."
  },
  {
    id: "prog-automotive-dip",
    code: "2011995",
    name: "Diploma in Automotive Engineering",
    level: "Diploma",
    category: "Professional & Technical",
    clusterGroupName: "TVET Engineering Diploma Pathway",
    minimumMeanGrade: "C-",
    subjectRequirements: [
      { subject: "Mathematics", minGrade: "D+" },
      { subject: "Physics", minGrade: "D+", alternativeSubjects: ["Chemistry", "Power Mechanics"] }
    ],
    institutions: [
      { institutionId: "inst-19", institutionCode: "201", institutionName: "Kabete National Polytechnic", county: "Nairobi", type: "National Polytechnic" },
      { institutionId: "inst-20", institutionCode: "202", institutionName: "Nairobi Technical Training Institute", county: "Nairobi", type: "Technical College" },
      { institutionId: "inst-24", institutionCode: "206", institutionName: "Eldoret National Polytechnic", county: "Uasin Gishu", type: "National Polytechnic" },
      { institutionId: "inst-27", institutionCode: "209", institutionName: "Railway Training Institute", county: "Nairobi", type: "Technical College" }
    ],
    active: true,
    notes: "Advanced motor vehicle diagnosis, ECU tuning, electric vehicle technology, and fleet maintenance."
  },
  // =========================================================================
  // 12. TECHNICAL CERTIFICATES & ARTISANS (Minimum D / E)
  // =========================================================================
  {
    id: "prog-it-cert",
    code: "2011120",
    name: "Certificate in Information Communication Technology",
    level: "Certificate",
    category: "Computing & IT",
    clusterGroupName: "TVET Certificate Pathway",
    minimumMeanGrade: "D",
    subjectRequirements: [
      { subject: "Mathematics", minGrade: "D-" },
      { subject: "English", minGrade: "D-", alternativeSubjects: ["Kiswahili"] }
    ],
    institutions: [
      { institutionId: "inst-19", institutionCode: "201", institutionName: "Kabete National Polytechnic", county: "Nairobi", type: "National Polytechnic" },
      { institutionId: "inst-20", institutionCode: "202", institutionName: "Nairobi Technical Training Institute", county: "Nairobi", type: "Technical College" },
      { institutionId: "inst-23", institutionCode: "205", institutionName: "Rift Valley Institute of Science and Technology", county: "Nakuru", type: "Technical College" }
    ],
    active: true,
    notes: "Foundational computing certification enabling direct entry into IT technician roles or progression to Diploma."
  },
  {
    id: "prog-elec-cert",
    code: "2011250",
    name: "Certificate in Electrical Installation & Electronics",
    level: "Certificate",
    category: "Engineering",
    clusterGroupName: "TVET Certificate Pathway",
    minimumMeanGrade: "D",
    subjectRequirements: [
      { subject: "Mathematics", minGrade: "D-" }
    ],
    institutions: [
      { institutionId: "inst-19", institutionCode: "201", institutionName: "Kabete National Polytechnic", county: "Nairobi", type: "National Polytechnic" },
      { institutionId: "inst-20", institutionCode: "202", institutionName: "Nairobi Technical Training Institute", county: "Nairobi", type: "Technical College" },
      { institutionId: "inst-23", institutionCode: "205", institutionName: "Rift Valley Institute of Science and Technology", county: "Nakuru", type: "Technical College" }
    ],
    active: true,
    notes: "Qualifies candidates for EPRA Class C electrical installation licensing."
  },
  {
    id: "prog-automotive-cert",
    code: "2011998",
    name: "Certificate in Motor Vehicle Mechanics",
    level: "Certificate",
    category: "Professional & Technical",
    clusterGroupName: "TVET Certificate Pathway",
    minimumMeanGrade: "D",
    subjectRequirements: [
      { subject: "Mathematics", minGrade: "D-" }
    ],
    institutions: [
      { institutionId: "inst-19", institutionCode: "201", institutionName: "Kabete National Polytechnic", county: "Nairobi", type: "National Polytechnic" },
      { institutionId: "inst-23", institutionCode: "205", institutionName: "Rift Valley Institute of Science and Technology", county: "Nakuru", type: "Technical College" },
      { institutionId: "inst-27", institutionCode: "209", institutionName: "Railway Training Institute", county: "Nairobi", type: "Technical College" }
    ],
    active: true,
    notes: "Mechanical workshop training for engine overhaul, transmission service, and vehicle inspection."
  },
  {
    id: "prog-elec-artisan",
    code: "2011290",
    name: "Artisan in Electrical Installation",
    level: "Artisan",
    category: "Engineering",
    clusterGroupName: "TVET Artisan Pathway",
    minimumMeanGrade: "E",
    subjectRequirements: [],
    institutions: [
      { institutionId: "inst-19", institutionCode: "201", institutionName: "Kabete National Polytechnic", county: "Nairobi", type: "National Polytechnic" },
      { institutionId: "inst-23", institutionCode: "205", institutionName: "Rift Valley Institute of Science and Technology", county: "Nakuru", type: "Technical College" }
    ],
    active: true,
    notes: "Open vocational qualification for KCSE candidates with D- or E grades."
  },
  {
    id: "prog-culinary-artisan",
    code: "2011990",
    name: "Artisan in Food and Beverage",
    level: "Artisan",
    category: "Hospitality & Creative",
    clusterGroupName: "TVET Artisan Pathway",
    minimumMeanGrade: "E",
    subjectRequirements: [],
    institutions: [
      { institutionId: "inst-20", institutionCode: "202", institutionName: "Nairobi Technical Training Institute", county: "Nairobi", type: "Technical College" },
      { institutionId: "inst-23", institutionCode: "205", institutionName: "Rift Valley Institute of Science and Technology", county: "Nakuru", type: "Technical College" }
    ],
    active: true,
    notes: "Foundation cooking and kitchen support training open to all KCSE grades."
  },
  ...ADDITIONAL_PROGRAMMES
];

// src/data/kcseSubjects.ts
var GRADE_POINTS = {
  "A": 12,
  "A-": 11,
  "B+": 10,
  "B": 9,
  "B-": 8,
  "C+": 7,
  "C": 6,
  "C-": 5,
  "D+": 4,
  "D": 3,
  "D-": 2,
  "E": 1
};

// src/lib/clusterCalculator.ts
function calculateKcseMeanGrade(enteredSubjects) {
  if (!enteredSubjects || enteredSubjects.length === 0) {
    return {
      meanGrade: "E",
      meanPoints: 1,
      totalAggregate: 7,
      consideredSubjects: [],
      isComplete: false
    };
  }
  const subjectMap = /* @__PURE__ */ new Map();
  for (const s of enteredSubjects) {
    const pts = GRADE_POINTS[s.grade] || 1;
    subjectMap.set(s.subject, { subject: s.subject, grade: s.grade, points: pts });
  }
  const english = subjectMap.get("English");
  const kiswahili = subjectMap.get("Kiswahili");
  const math = subjectMap.get("Mathematics");
  const scienceNames = ["Biology", "Chemistry", "Physics", "General Science"];
  const availableSciences = [];
  for (const sci of scienceNames) {
    const found = subjectMap.get(sci);
    if (found) availableSciences.push(found);
  }
  availableSciences.sort((a, b) => b.points - a.points);
  const best2Sciences = availableSciences.slice(0, 2);
  const usedKeys = /* @__PURE__ */ new Set();
  if (english) usedKeys.add("English");
  if (kiswahili) usedKeys.add("Kiswahili");
  if (math) usedKeys.add("Mathematics");
  best2Sciences.forEach((s) => usedKeys.add(s.subject));
  const remainingSubjects = [];
  for (const [name, data] of subjectMap.entries()) {
    if (!usedKeys.has(name)) {
      remainingSubjects.push(data);
    }
  }
  remainingSubjects.sort((a, b) => b.points - a.points);
  const selectedSubjects = [];
  if (english) selectedSubjects.push(english);
  if (kiswahili) selectedSubjects.push(kiswahili);
  if (math) selectedSubjects.push(math);
  selectedSubjects.push(...best2Sciences);
  while (selectedSubjects.length < 7 && remainingSubjects.length > 0) {
    const next = remainingSubjects.shift();
    if (next) selectedSubjects.push(next);
  }
  if (selectedSubjects.length < 7) {
    for (const [name, data] of subjectMap.entries()) {
      if (!selectedSubjects.some((s) => s.subject === name) && selectedSubjects.length < 7) {
        selectedSubjects.push(data);
      }
    }
  }
  const isComplete = selectedSubjects.length >= 7;
  const countToDivide = selectedSubjects.length >= 7 ? 7 : Math.max(1, selectedSubjects.length);
  const sumPoints = selectedSubjects.reduce((acc, curr) => acc + curr.points, 0);
  const meanPoints = Number((sumPoints / countToDivide).toFixed(2));
  let meanGrade = "E";
  if (sumPoints >= 81) meanGrade = "A";
  else if (sumPoints >= 74) meanGrade = "A-";
  else if (sumPoints >= 67) meanGrade = "B+";
  else if (sumPoints >= 60) meanGrade = "B";
  else if (sumPoints >= 53) meanGrade = "B-";
  else if (sumPoints >= 46) meanGrade = "C+";
  else if (sumPoints >= 39) meanGrade = "C";
  else if (sumPoints >= 32) meanGrade = "C-";
  else if (sumPoints >= 25) meanGrade = "D+";
  else if (sumPoints >= 18) meanGrade = "D";
  else if (sumPoints >= 11) meanGrade = "D-";
  else meanGrade = "E";
  return {
    meanGrade,
    meanPoints,
    totalAggregate: sumPoints,
    consideredSubjects: selectedSubjects,
    isComplete
  };
}
function calculateEstimatedClusterPoints(studentSubjects, clusterSubjectNames = ["Mathematics", "Physics", "Chemistry", "English"], totalAggregateOverride) {
  if (!studentSubjects || studentSubjects.length === 0) return 0;
  const subList = studentSubjects.map((s, idx) => ({
    index: idx,
    name: s.subject,
    norm: s.subject.toLowerCase().replace(/[^a-z0-9]/g, ""),
    points: GRADE_POINTS[s.grade] || 1,
    grade: s.grade
  }));
  const matchesSlot = (sub, slotDef) => {
    const sNorm = sub.norm;
    const defLower = slotDef.toLowerCase();
    if (defLower.includes("any science") || defLower.includes("group 2") || defLower.includes("physical science")) {
      if (["biology", "physics", "chemistry", "generalscience", "computerstudies", "agriculture"].some((k) => sNorm.includes(k))) {
        return true;
      }
    }
    if (defLower.includes("any humanities") || defLower.includes("group 3")) {
      if (["history", "geography", "cre", "ire", "hre"].some((k) => sNorm.includes(k))) {
        return true;
      }
    }
    if (defLower.includes("any technical") || defLower.includes("group 4") || defLower.includes("group 5") || defLower.includes("applied")) {
      if (["business", "computer", "agriculture", "homescience", "art", "drawing", "aviation", "woodwork", "metalwork", "building", "electricity", "mechanics", "french", "german", "arabic", "music"].some((k) => sNorm.includes(k))) {
        return true;
      }
    }
    if (defLower.includes("any 4th") || defLower.includes("any other") || defLower.includes("any subject") || defLower.includes("remaining")) {
      return true;
    }
    const parts = slotDef.split(/\/|\sor\s/).map((p) => p.trim().toLowerCase().replace(/[^a-z0-9]/g, ""));
    for (const part of parts) {
      if (!part) continue;
      if (sNorm === part) return true;
      if (sNorm.includes(part) || part.includes(sNorm)) return true;
      if (part.startsWith("cre") && sNorm.startsWith("cre") || part.startsWith("ire") && sNorm.startsWith("ire") || part.startsWith("history") && sNorm.startsWith("history") || part.startsWith("business") && sNorm.startsWith("business") || part.startsWith("computer") && sNorm.startsWith("computer") || part.startsWith("agriculture") && sNorm.startsWith("agriculture")) {
        return true;
      }
    }
    return false;
  };
  const effectiveSlots = clusterSubjectNames.slice(0, 4);
  while (effectiveSlots.length < 4) {
    effectiveSlots.push("Any Remaining Subject");
  }
  const slotCandidates = effectiveSlots.map((slotDef) => {
    return subList.filter((s) => matchesSlot(s, slotDef)).sort((a, b) => b.points - a.points);
  });
  const usedSubjectIndices = /* @__PURE__ */ new Set();
  function searchMaxR(slotIdx) {
    if (slotIdx === effectiveSlots.length) return 0;
    let max = -1;
    const candidates = slotCandidates[slotIdx];
    for (const c of candidates) {
      if (!usedSubjectIndices.has(c.index)) {
        usedSubjectIndices.add(c.index);
        const nextScore = searchMaxR(slotIdx + 1);
        if (nextScore >= 0) {
          max = Math.max(max, c.points + nextScore);
        }
        usedSubjectIndices.delete(c.index);
      }
    }
    if (max === -1) {
      const nextScore = searchMaxR(slotIdx + 1);
      max = 1 + (nextScore >= 0 ? nextScore : 0);
    }
    return max;
  }
  const optimalR = searchMaxR(0);
  const rPoints = Math.max(4, optimalR);
  let t = totalAggregateOverride;
  if (!t || t <= 0) {
    const allPoints = subList.map((s) => s.points).sort((a, b) => b - a);
    const best7 = allPoints.slice(0, 7);
    t = best7.reduce((acc, v) => acc + v, 0);
  }
  const r = Math.min(48, Math.max(4, rPoints));
  const tTotal = Math.min(84, Math.max(7, t));
  const ratio = r / 48 * (tTotal / 84);
  const clusterScore = Math.sqrt(ratio) * 48;
  return Number(clusterScore.toFixed(3));
}
function isGradeEqualOrHigher(studentGrade, requiredGrade) {
  if (!studentGrade) return false;
  const studentPts = GRADE_POINTS[studentGrade] || 0;
  const requiredPts = GRADE_POINTS[requiredGrade] || 0;
  return studentPts >= requiredPts;
}

// src/lib/eligibilityEngine.ts
function evaluateProgrammeEligibility(programme, input) {
  const studentSubjectMap = /* @__PURE__ */ new Map();
  const studentSubjectGrades = input.subjects.map((s) => ({
    subject: s.subject,
    grade: s.grade,
    points: GRADE_POINTS[s.grade] || 1
  }));
  for (const s of input.subjects) {
    studentSubjectMap.set(s.subject, s.grade);
  }
  const meetsMeanGrade = isGradeEqualOrHigher(input.meanGrade, programme.minimumMeanGrade);
  const subjectChecks = [];
  let allSubjectRequirementsMet = true;
  const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  const getStudentGrade = (targetName) => {
    if (studentSubjectMap.has(targetName)) return studentSubjectMap.get(targetName);
    const targetNorm = norm(targetName);
    for (const [key, val] of studentSubjectMap.entries()) {
      const keyNorm = norm(key);
      if (keyNorm === targetNorm) return val;
      if (keyNorm.startsWith("cre") && targetNorm.startsWith("cre") || keyNorm.startsWith("ire") && targetNorm.startsWith("ire") || keyNorm.startsWith("history") && targetNorm.startsWith("history") || keyNorm.startsWith("business") && targetNorm.startsWith("business") || keyNorm.startsWith("computer") && targetNorm.startsWith("computer") || keyNorm.startsWith("agriculture") && targetNorm.startsWith("agriculture")) {
        return val;
      }
    }
    return void 0;
  };
  for (const req of programme.subjectRequirements) {
    let studentGrade = getStudentGrade(req.subject);
    let passed = isGradeEqualOrHigher(studentGrade, req.minGrade);
    if (!passed && req.alternativeSubjects && req.alternativeSubjects.length > 0) {
      for (const alt of req.alternativeSubjects) {
        const altGrade = getStudentGrade(alt);
        if (isGradeEqualOrHigher(altGrade, req.minGrade)) {
          studentGrade = altGrade;
          passed = true;
          break;
        }
      }
    }
    if (!passed) {
      allSubjectRequirementsMet = false;
    }
    subjectChecks.push({
      subject: req.subject,
      requiredGrade: req.minGrade,
      studentGrade,
      passed,
      note: passed ? `Satisfies minimum ${req.minGrade}` : studentGrade ? `Scored ${studentGrade}, below required ${req.minGrade}` : `Subject not entered in KCSE results (requires ${req.minGrade})`
    });
  }
  const isEligible = meetsMeanGrade && allSubjectRequirementsMet;
  const eligibilityStatus = isEligible ? "ELIGIBLE" : "INELIGIBLE";
  const isDegree = programme.level === "Degree";
  let studentEstimatedClusterPoints = void 0;
  let cutoffComparison = "NOT_APPLICABLE_TVET";
  let cutoffStatusText = "Admissions based on KCSE Mean Grade & subject prerequisites (No cluster points for TVET/Diploma)";
  let institutionHistoricalCutoff = void 0;
  const institutionsBreakdown = [];
  let minInstitutionCutoff = void 0;
  let maxInstitutionCutoff = void 0;
  let qualifyingInstitutionsCount = 0;
  const latestPublishedYear = "2024/2025";
  if (isDegree) {
    const clusterSubjects = programme.clusterSubjects && programme.clusterSubjects.length === 4 ? programme.clusterSubjects : ["Mathematics", "Physics", "Chemistry", "English"];
    studentEstimatedClusterPoints = calculateEstimatedClusterPoints(
      input.subjects,
      clusterSubjects,
      input.totalAggregate
    );
    for (const inst of programme.institutions) {
      const instCutoff = inst.historicalCutoffs?.[latestPublishedYear] || inst.historicalCutoffs?.["2023/2024"];
      if (instCutoff !== void 0 && instCutoff > 0) {
        if (minInstitutionCutoff === void 0 || instCutoff < minInstitutionCutoff) {
          minInstitutionCutoff = instCutoff;
        }
        if (maxInstitutionCutoff === void 0 || instCutoff > maxInstitutionCutoff) {
          maxInstitutionCutoff = instCutoff;
        }
        const diff = Number((studentEstimatedClusterPoints - instCutoff).toFixed(3));
        let status = "BELOW_CUTOFF";
        let statusText = "";
        if (diff >= 0.5) {
          status = "QUALIFIES_ABOVE";
          statusText = `+${diff.toFixed(2)} pts Above Cut-Off (${instCutoff})`;
          qualifyingInstitutionsCount++;
        } else if (diff >= -1.2) {
          status = "WITHIN_RANGE";
          statusText = `Competitive (${diff >= 0 ? "+" : ""}${diff.toFixed(2)} pts of ${instCutoff})`;
          qualifyingInstitutionsCount++;
        } else {
          status = "BELOW_CUTOFF";
          statusText = `${Math.abs(diff).toFixed(2)} pts Below Cut-Off (${instCutoff})`;
        }
        institutionsBreakdown.push({
          institutionId: inst.institutionId,
          institutionCode: inst.institutionCode,
          institutionName: inst.institutionName,
          county: inst.county,
          type: inst.type,
          cutoffPoints: instCutoff,
          admissionYear: latestPublishedYear,
          diff,
          status,
          statusText
        });
      } else {
        institutionsBreakdown.push({
          institutionId: inst.institutionId,
          institutionCode: inst.institutionCode,
          institutionName: inst.institutionName,
          county: inst.county,
          type: inst.type,
          status: "NO_HISTORICAL_DATA",
          statusText: "Cut-off pending official KUCCPS release"
        });
      }
    }
    institutionsBreakdown.sort((a, b) => {
      const order = { QUALIFIES_ABOVE: 1, WITHIN_RANGE: 2, NO_HISTORICAL_DATA: 3, BELOW_CUTOFF: 4, NOT_APPLICABLE_TVET: 5 };
      const diffOrder = (order[a.status] || 99) - (order[b.status] || 99);
      if (diffOrder !== 0) return diffOrder;
      return (a.cutoffPoints || 999) - (b.cutoffPoints || 999);
    });
    if (qualifyingInstitutionsCount > 0) {
      const hasStrong = institutionsBreakdown.some((i) => i.status === "QUALIFIES_ABOVE");
      if (hasStrong) {
        cutoffComparison = "ABOVE_CUTOFF";
        cutoffStatusText = qualifyingInstitutionsCount === programme.institutions.length ? `Your cluster score (${studentEstimatedClusterPoints.toFixed(3)}) exceeds cut-offs at ALL ${programme.institutions.length} offering universities (Range: ${minInstitutionCutoff} - ${maxInstitutionCutoff} pts)` : `Your cluster score (${studentEstimatedClusterPoints.toFixed(3)}) meets cut-offs at ${qualifyingInstitutionsCount} of ${programme.institutions.length} offering universities (Cut-off range: ${minInstitutionCutoff} - ${maxInstitutionCutoff} pts)`;
      } else {
        cutoffComparison = "WITHIN_RANGE";
        cutoffStatusText = `Your cluster score (${studentEstimatedClusterPoints.toFixed(3)}) is within competitive range at ${qualifyingInstitutionsCount} offering universities (Range: ${minInstitutionCutoff} - ${maxInstitutionCutoff} pts)`;
      }
    } else if (minInstitutionCutoff !== void 0) {
      cutoffComparison = "BELOW_CUTOFF";
      cutoffStatusText = `Your cluster score (${studentEstimatedClusterPoints.toFixed(3)}) is below historical cut-offs (Lowest university cut-off is ${minInstitutionCutoff} pts; highest is ${maxInstitutionCutoff} pts)`;
    } else {
      cutoffComparison = "HISTORICAL_CUTOFF_UNAVAILABLE";
      cutoffStatusText = "Official historical cut-off pending KUCCPS publication";
    }
    const bestInst = institutionsBreakdown.find((i) => i.status === "QUALIFIES_ABOVE") || institutionsBreakdown.find((i) => i.status === "WITHIN_RANGE") || institutionsBreakdown[0];
    if (bestInst && bestInst.cutoffPoints) {
      institutionHistoricalCutoff = {
        institutionName: bestInst.institutionName,
        county: bestInst.county,
        admissionYear: latestPublishedYear,
        cutoffPoints: bestInst.cutoffPoints,
        source: `KUCCPS Published Placement Data ${latestPublishedYear}`
      };
    }
  } else {
    for (const inst of programme.institutions) {
      institutionsBreakdown.push({
        institutionId: inst.institutionId,
        institutionCode: inst.institutionCode,
        institutionName: inst.institutionName,
        county: inst.county,
        type: inst.type,
        status: "NOT_APPLICABLE_TVET",
        statusText: `Direct placement via KCSE Mean Grade (${programme.minimumMeanGrade})`
      });
    }
  }
  let matchScore = 0;
  const matchedKeywords = [];
  const matchedFieldNames = [];
  let isFieldMatch = false;
  const categoryKeywords = {
    "Computing & IT": ["coding", "technology", "gaming", "electronics", "problem solving", "computers", "software", "programming", "cybersecurity", "data", "cloud", "systems", "information", "hardware"],
    "Engineering": ["machines", "engineering", "electronics", "construction", "design", "mathematics", "mechanics", "building", "electrical", "civil", "mechatronics", "automotive", "telecommunications", "solar", "drilling", "mining"],
    "Architecture & Design": ["drawing", "art", "design", "construction", "photography", "creative", "architecture", "surveying", "valuation", "interior", "landscape", "geoinformatics", "planning", "town"],
    "Health Sciences": ["medicine", "helping people", "science", "biology", "health", "hospital", "nursing", "pharmacy", "laboratory", "clinical", "dietetics", "nutrition", "dental", "radiography", "physiotherapy"],
    "Pure & Applied Sciences": ["science", "mathematics", "research", "problem solving", "biology", "chemistry", "physics", "biochemistry", "genetics", "statistics", "geology", "meteorology"],
    "Business & Finance": ["business", "entrepreneurship", "finance", "mathematics", "leadership", "accounting", "marketing", "banking", "actuarial", "economics", "procurement", "logistics", "sacco"],
    "Agriculture & Environment": ["agriculture", "animals", "science", "nature", "farming", "environment", "agribusiness", "horticulture", "crops", "dairy", "wildlife", "fisheries", "forestry"],
    "Education": ["teaching", "helping people", "communication", "reading", "mentoring", "instructor", "pedagogy", "training"],
    "Law & Governance": ["law", "reading", "writing", "public speaking", "leadership", "communication", "justice", "criminology", "diplomacy", "governance", "policy", "psychology", "counseling"],
    "Hospitality & Creative": ["travel", "fashion", "beauty", "art", "design", "photography", "food", "cooking", "culinary", "hotel", "tourism", "safari", "broadcasting", "journalism", "film", "music"],
    "Professional & Technical": ["logistics", "machines", "engineering", "vehicles", "management", "real estate", "plumbing", "welding", "carpentry"]
  };
  const relevantKeywords = categoryKeywords[programme.category] || [];
  const normalizedHobbies = input.hobbies.map((h) => h.toLowerCase());
  for (const kw of relevantKeywords) {
    if (normalizedHobbies.some((h) => h.includes(kw) || kw.includes(h))) {
      matchScore += 20;
      matchedKeywords.push(kw);
    }
  }
  const progNameLower = programme.name.toLowerCase();
  const progCatLower = programme.category.toLowerCase();
  const progClusterLower = (programme.clusterGroupName || "").toLowerCase();
  for (const hobby of input.hobbies) {
    if (!hobby || !hobby.trim()) continue;
    const hLower = hobby.toLowerCase();
    const directHit = progNameLower.includes(hLower) || hLower.includes(progNameLower) || progCatLower.includes(hLower) || hLower.includes(progCatLower) || progClusterLower.includes(hLower);
    const hobbyTokens = hLower.split(/[\s,&/()\-]+/).filter((t) => t.length >= 4 && !["with", "management", "science", "technology", "engineering", "school", "secondary"].includes(t));
    const progTokens = (progNameLower + " " + progCatLower).split(/[\s,&/()\-]+/).filter((t) => t.length >= 4);
    const tokenHit = hobbyTokens.some((t) => progTokens.includes(t));
    if (directHit || tokenHit) {
      if (!matchedFieldNames.includes(hobby)) {
        matchedFieldNames.push(hobby);
      }
      isFieldMatch = true;
      matchScore += 35;
    }
  }
  let careerMatch = "LOW";
  if (input.intendedCourse && input.intendedCourse !== "I don't know yet") {
    const intendedList = input.intendedCourse.split(",").map((c) => c.trim().toLowerCase()).filter(Boolean);
    for (const intended of intendedList) {
      if (progNameLower.includes(intended) || intended.includes(progNameLower)) {
        careerMatch = "HIGH";
        matchScore += 55;
        isFieldMatch = true;
        const label = `Intended: ${intended}`;
        if (!matchedFieldNames.includes(label)) {
          matchedFieldNames.unshift(label);
        }
      } else if (progCatLower.includes(intended) || intended.includes(progCatLower) || progClusterLower.includes(intended)) {
        if (careerMatch !== "HIGH") careerMatch = "MODERATE";
        matchScore += 30;
        isFieldMatch = true;
      }
    }
  }
  let interestMatch = "LOW";
  if (matchedKeywords.length >= 2 || matchedFieldNames.length >= 1) interestMatch = "HIGH";
  else if (matchedKeywords.length === 1) interestMatch = "MODERATE";
  if (isEligible) matchScore += 50;
  if (cutoffComparison === "ABOVE_CUTOFF") matchScore += 25;
  else if (cutoffComparison === "WITHIN_RANGE") matchScore += 15;
  const missing = [];
  if (!meetsMeanGrade) {
    missing.push(`Minimum Mean Grade of ${programme.minimumMeanGrade} (Your grade: ${input.meanGrade})`);
  }
  for (const sc of subjectChecks) {
    if (!sc.passed) {
      missing.push(`${sc.subject}: minimum ${sc.requiredGrade} (Your grade: ${sc.studentGrade || "Not taken"})`);
    }
  }
  let recommendedReason = "";
  if (isEligible) {
    if (isDegree) {
      recommendedReason = matchedKeywords.length > 0 || matchedFieldNames.length > 0 ? `Meets published KCSE degree prerequisites (${programme.minimumMeanGrade}) and aligns with your chosen career interest in ${matchedFieldNames[0] || matchedKeywords.slice(0, 2).join(", ")}. Estimated cluster: ${studentEstimatedClusterPoints}.` : `Meets all published KUCCPS degree minimums (${programme.minimumMeanGrade} & subject requirements). Estimated cluster: ${studentEstimatedClusterPoints}.`;
    } else {
      recommendedReason = matchedKeywords.length > 0 || matchedFieldNames.length > 0 ? `Meets published ${programme.level} entry criteria (Min Mean Grade ${programme.minimumMeanGrade}) and matches your stated interest in ${matchedFieldNames[0] || matchedKeywords.slice(0, 2).join(", ")}. TVET placement is based on mean grade.` : `Academically eligible for ${programme.level} placement (Requires Mean Grade ${programme.minimumMeanGrade}). No cluster points required.`;
    }
  } else {
    recommendedReason = `Does not meet published minimum criteria: Requires ${missing.join(", ")}.`;
  }
  const fieldMatchReason = isFieldMatch && matchedFieldNames.length > 0 ? `Matches your selected field in ${matchedFieldNames.slice(0, 2).join(" & ")}` : isFieldMatch ? "In your chosen study field" : void 0;
  const programmeCluster = isDegree ? programme.clusterGroupName || `KUCCPS Cluster ${programme.clusterNumber}: ${programme.category}` : `TVET / ${programme.level} (Cluster Points Do Not Apply)`;
  return {
    programmeId: programme.id,
    programmeCode: programme.code,
    programmeName: programme.name,
    level: programme.level,
    category: programme.category,
    // 1. Programme data
    programmeCluster,
    programmeClusterNumber: programme.clusterNumber,
    programmeMinimumMeanGrade: programme.minimumMeanGrade,
    programmeSubjectRequirements: programme.subjectRequirements,
    programmeHistoricalCutoffs: programme.historicalCutoffs,
    // 2. Student score data
    studentSubjectGrades,
    studentEstimatedClusterPoints,
    // 3. Institution data
    institutionHistoricalCutoff,
    institutionCount: programme.institutions.length,
    institutionsBreakdown,
    qualifyingInstitutionsCount,
    minInstitutionCutoff,
    maxInstitutionCutoff,
    // 4. Eligibility evaluation
    eligibilityStatus,
    meetsMeanGrade,
    studentMeanGrade: input.meanGrade,
    subjectChecks,
    allSubjectRequirementsMet,
    // 5. Cut-off comparison
    cutoffComparison,
    cutoffStatusText,
    // 6. Fit dimensions
    interestMatch,
    careerMatch,
    matchScore,
    matchedInterestKeywords: matchedKeywords,
    // 7. Rationale
    recommendedReason,
    missingRequirements: missing,
    // 8. Targeted Field Match
    isFieldMatch,
    matchedFieldNames,
    fieldMatchReason
  };
}
function analyzeIntendedCourse(intendedCourse, programmes, input) {
  if (!intendedCourse || intendedCourse === "I don't know yet") {
    return {
      courseName: "Undecided / Open Exploration",
      status: "UNDECIDED",
      missingRequirements: [],
      recommendationNote: "You indicated you are still exploring. Our system has analyzed your subject strengths and stated interests to recommend suitable university, diploma, and technical college pathways."
    };
  }
  const normIntended = intendedCourse.toLowerCase().trim();
  let matchedProg = programmes.find(
    (p) => p.name.toLowerCase().includes(normIntended) || normIntended.includes(p.name.toLowerCase()) || normIntended.includes(p.category.toLowerCase())
  );
  if (!matchedProg) {
    const tokens = normIntended.split(/\s+/).filter((t) => t.length > 3);
    for (const token of tokens) {
      matchedProg = programmes.find((p) => p.name.toLowerCase().includes(token));
      if (matchedProg) break;
    }
  }
  if (!matchedProg) {
    return {
      courseName: intendedCourse,
      status: "UNDECIDED",
      missingRequirements: [],
      recommendationNote: `You expressed interest in ${intendedCourse}. While this exact title is not directly listed, related degree, diploma, and technical courses are mapped below based on your grades.`
    };
  }
  const evalResult = evaluateProgrammeEligibility(matchedProg, input);
  if (evalResult.eligibilityStatus === "ELIGIBLE") {
    const scoreNote = evalResult.studentEstimatedClusterPoints !== void 0 ? `Your estimated cluster score is ${evalResult.studentEstimatedClusterPoints}.` : `Admission is based on your KCSE Mean Grade (${input.meanGrade}).`;
    return {
      courseName: intendedCourse,
      status: "STRONG_MATCH",
      matchedProgramme: matchedProg,
      eligibility: evalResult,
      missingRequirements: [],
      recommendationNote: `Great news: Your KCSE academic profile meets the published minimum requirements for ${matchedProg.name}. ${scoreNote}`
    };
  } else {
    return {
      courseName: intendedCourse,
      status: "ELIGIBLE_ALTERNATIVE_SUGGESTED",
      matchedProgramme: matchedProg,
      eligibility: evalResult,
      missingRequirements: evalResult.missingRequirements,
      recommendationNote: `Your intended course (${intendedCourse}) requires: ${evalResult.missingRequirements.join("; ")}. Don't be discouraged: We have provided high-value Diploma and TVET pathways below that bridge directly into this field!`
    };
  }
}

// src/lib/recommendationEngine.ts
function runFullCareerAssessment(assessmentInput, programmes) {
  const meanGradeResult = calculateKcseMeanGrade(assessmentInput.subjects);
  const generalCluster = calculateEstimatedClusterPoints(
    assessmentInput.subjects,
    ["Mathematics", "English or Kiswahili", "Physics or Chemistry or Biology", "Any 4th Subject"],
    meanGradeResult.totalAggregate
  );
  const evalInput = {
    meanGrade: meanGradeResult.meanGrade,
    totalAggregate: meanGradeResult.totalAggregate,
    subjects: assessmentInput.subjects,
    hobbies: assessmentInput.hobbies.concat(assessmentInput.otherHobby ? [assessmentInput.otherHobby] : []),
    intendedCourse: assessmentInput.intendedCourse
  };
  const intendedAnalysis = analyzeIntendedCourse(
    assessmentInput.intendedCourse,
    programmes,
    evalInput
  );
  const activeProgrammes = programmes.filter((p) => p.active);
  const allEvaluations = activeProgrammes.map(
    (p) => evaluateProgrammeEligibility(p, evalInput)
  );
  const rawEligibleProgrammes = allEvaluations.filter((e) => e.eligibilityStatus === "ELIGIBLE");
  rawEligibleProgrammes.sort((a, b) => b.matchScore - a.matchScore);
  const fieldMatchProgrammes = rawEligibleProgrammes.filter((p) => p.isFieldMatch);
  const otherEligibleProgrammes = rawEligibleProgrammes.filter((p) => !p.isFieldMatch);
  const eligibleProgrammes = [...fieldMatchProgrammes, ...otherEligibleProgrammes];
  const competitiveProgrammes = eligibleProgrammes.filter(
    (p) => p.level !== "Degree" || p.cutoffComparison === "ABOVE_CUTOFF" || p.cutoffComparison === "WITHIN_RANGE"
  );
  const aspirationalProgrammes = eligibleProgrammes.filter(
    (p) => p.level === "Degree" && p.cutoffComparison === "BELOW_CUTOFF"
  );
  const topRecommendations = eligibleProgrammes.slice(0, 8);
  const alternativePathways = [];
  const diplomaOptions = allEvaluations.filter((e) => e.level === "Diploma" && e.eligibilityStatus === "ELIGIBLE");
  const certOptions = allEvaluations.filter((e) => (e.level === "Certificate" || e.level === "Artisan") && e.eligibilityStatus === "ELIGIBLE");
  if (intendedAnalysis.status === "ELIGIBLE_ALTERNATIVE_SUGGESTED") {
    const cat = intendedAnalysis.matchedProgramme?.category;
    const sameCatDip = diplomaOptions.find((d) => d.category === cat);
    if (sameCatDip) {
      alternativePathways.push({
        category: sameCatDip.category,
        level: "Diploma",
        programmeName: sameCatDip.programmeName,
        reason: `Direct stepping-stone: Complete this 2-year National Polytechnic Diploma and apply for credit transfer / direct progression to ${intendedAnalysis.matchedProgramme?.name}.`
      });
    }
  }
  for (const dip of diplomaOptions.slice(0, 3)) {
    if (!alternativePathways.some((a) => a.programmeName === dip.programmeName)) {
      alternativePathways.push({
        category: dip.category,
        level: dip.level,
        programmeName: dip.programmeName,
        reason: `Practical vocational route with high industry demand and entry threshold matching your ${meanGradeResult.meanGrade} profile.`
      });
    }
  }
  for (const cert of certOptions.slice(0, 3)) {
    if (!alternativePathways.some((a) => a.programmeName === cert.programmeName)) {
      alternativePathways.push({
        category: cert.category,
        level: cert.level,
        programmeName: cert.programmeName,
        reason: `Competency-based technical certification enabling hands-on mastery and quick entry into technical enterprise or self-employment.`
      });
    }
  }
  const institutionOfferings = [];
  for (const prog of eligibleProgrammes) {
    const rawProg = programmes.find((p) => p.id === prog.programmeId);
    if (!rawProg) continue;
    const isDegree = prog.level === "Degree";
    for (const inst of rawProg.institutions) {
      const historicalCutoff = isDegree && inst.historicalCutoffs ? inst.historicalCutoffs["2024/2025"] : void 0;
      const admissionYear = isDegree && historicalCutoff ? "2024/2025" : void 0;
      let statusText = `Placement based on KCSE Mean Grade (${prog.programmeMinimumMeanGrade})`;
      if (isDegree && historicalCutoff && prog.studentEstimatedClusterPoints !== void 0) {
        const margin = Number((prog.studentEstimatedClusterPoints - historicalCutoff).toFixed(2));
        if (margin >= 0.5) {
          statusText = `+${margin.toFixed(2)} pts Above Cut-Off (${historicalCutoff}) \u2014 High Placement Chance`;
        } else if (margin >= -1.2) {
          statusText = `${margin >= 0 ? "+" : ""}${margin.toFixed(2)} pts of Cut-Off (${historicalCutoff}) \u2014 Competitive Range`;
        } else {
          statusText = `${Math.abs(margin).toFixed(2)} pts Below Cut-Off (${historicalCutoff}) \u2014 Higher Cut-Off University`;
        }
      } else if (isDegree) {
        statusText = prog.cutoffStatusText;
      }
      institutionOfferings.push({
        programmeName: prog.programmeName,
        level: prog.level,
        institutionName: inst.institutionName,
        county: inst.county,
        type: inst.type,
        admissionYear,
        historicalCutoff,
        studentScore: isDegree ? prog.studentEstimatedClusterPoints : void 0,
        cutoffStatusText: statusText
      });
    }
  }
  const degreeCount = eligibleProgrammes.filter((p) => p.level === "Degree").length;
  const diplomaCount = eligibleProgrammes.filter((p) => p.level === "Diploma").length;
  const tvetCount = eligibleProgrammes.filter((p) => p.level === "Certificate" || p.level === "Artisan" || p.level === "TVET").length;
  return {
    studentName: assessmentInput.studentName,
    studentEmail: assessmentInput.studentEmail,
    studentPhone: assessmentInput.studentPhone,
    kcseYear: assessmentInput.kcseYear,
    indexNumber: assessmentInput.indexNumber,
    subjects: assessmentInput.subjects.map((s) => ({
      subject: s.subject,
      grade: s.grade,
      points: GRADE_POINTS[s.grade] || 1
    })),
    hobbies: assessmentInput.hobbies,
    otherHobby: assessmentInput.otherHobby,
    intendedCourse: assessmentInput.intendedCourse,
    meanGrade: meanGradeResult.meanGrade,
    meanPoints: meanGradeResult.meanPoints,
    totalAggregate: meanGradeResult.totalAggregate,
    gradePointsDisplay: `${meanGradeResult.totalAggregate}/84 pts`,
    studentEstimatedClusterPoints: generalCluster,
    previewSummary: {
      meanGrade: meanGradeResult.meanGrade,
      gradePointsDisplay: `${meanGradeResult.totalAggregate}/84 pts`,
      studentEstimatedClusterPoints: generalCluster,
      potentialDegreeMatches: degreeCount,
      potentialDiplomaMatches: diplomaCount,
      potentialTvetMatches: tvetCount,
      totalEligibleInstitutions: institutionOfferings.length,
      totalEvaluatedProgrammes: activeProgrammes.length,
      intendedCoursePreview: assessmentInput.intendedCourse,
      intendedCourseMeetsMinimums: intendedAnalysis.status === "STRONG_MATCH"
    },
    detailedResults: {
      totalEvaluatedCount: activeProgrammes.length,
      intendedCourseAnalysis: intendedAnalysis,
      eligibleProgrammes,
      fieldMatchProgrammes,
      otherEligibleProgrammes,
      allEvaluations,
      competitiveProgrammes,
      aspirationalProgrammes,
      topRecommendations,
      alternativePathways,
      institutionOfferings
    }
  };
}

// src/lib/paystackUtils.ts
function cleanKey(val) {
  if (!val) return "";
  let str = String(val).trim();
  str = str.replace(/^["'`]|["'`]$/g, "").trim();
  str = str.replace(/[;,]$/, "").trim();
  str = str.replace(/[\r\n\t]/g, "").trim();
  return str;
}
function isUsableSecretKey(key) {
  if (!key) return false;
  const k = cleanKey(key);
  if (k.length < 15) return false;
  if (k.includes("YOUR_PAYSTACK") || k.includes("xxxx") || k.includes("sample") || k.includes("demo") || k.includes("pending") || k.includes("\u2022\u2022\u2022\u2022")) {
    return false;
  }
  return k.startsWith("sk_");
}
function isUsablePublicKey(key) {
  if (!key) return false;
  const k = cleanKey(key);
  if (k.length < 15) return false;
  if (k.includes("YOUR_PAYSTACK") || k.includes("xxxx") || k.includes("sample") || k.includes("demo") || k.includes("pending") || k.includes("\u2022\u2022\u2022\u2022")) {
    return false;
  }
  return k.startsWith("pk_");
}
function getPaystackKeys() {
  let rawPublic = cleanKey(
    process.env.PAYSTACK_PUBLIC_KEY || process.env.paystack_public_key || process.env.VITE_PAYSTACK_PUBLIC_KEY || process.env.vite_paystack_public_key || process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || process.env.PAYSTACK_PUBLIC || process.env.PAYSTACK_KEY
  );
  let rawSecret = cleanKey(
    process.env.PAYSTACK_SECRET_KEY || process.env.paystack_secret_key || process.env.PAYSTACK_SECRET || process.env.paystack_secret || process.env.PAYSTACK_PRIVATE_KEY || process.env.VITE_PAYSTACK_SECRET_KEY
  );
  if (!rawSecret) {
    for (const [key, val] of Object.entries(process.env)) {
      if (!val) continue;
      const upper = key.toUpperCase();
      const cleaned = cleanKey(val);
      if (cleaned.startsWith("sk_test_") || cleaned.startsWith("sk_live_")) {
        rawSecret = cleaned;
        break;
      }
      if (upper.includes("PAYSTACK") && (upper.includes("SECRET") || upper.includes("PRIVATE") || upper.includes("SEC_KEY") || upper.includes("_SK"))) {
        rawSecret = cleaned;
        break;
      }
    }
  }
  if (!rawPublic) {
    for (const [key, val] of Object.entries(process.env)) {
      if (!val) continue;
      const upper = key.toUpperCase();
      const cleaned = cleanKey(val);
      if (cleaned.startsWith("pk_test_") || cleaned.startsWith("pk_live_")) {
        rawPublic = cleaned;
        break;
      }
      if (upper.includes("PAYSTACK") && (upper.includes("PUBLIC") || upper.includes("PUB_KEY") || upper.includes("_PK"))) {
        rawPublic = cleaned;
        break;
      }
    }
  }
  if (rawPublic.startsWith("sk_") && !rawSecret.startsWith("sk_")) {
    const temp = rawPublic;
    rawPublic = rawSecret.startsWith("pk_") ? rawSecret : "";
    rawSecret = temp;
  } else if (rawSecret.startsWith("pk_") && !rawPublic.startsWith("pk_")) {
    const temp = rawSecret;
    rawSecret = rawPublic.startsWith("sk_") ? rawPublic : "";
    rawPublic = temp;
  }
  const hasRealPublic = isUsablePublicKey(rawPublic);
  const hasRealSecret = isUsableSecretKey(rawSecret);
  if (hasRealPublic || hasRealSecret) {
    return {
      publicKey: rawPublic,
      secretKey: rawSecret,
      source: "env",
      isConfigured: true,
      isTest: rawPublic.startsWith("pk_test_") || rawSecret.startsWith("sk_test_"),
      isLive: rawPublic.startsWith("pk_live_") || rawSecret.startsWith("sk_live_")
    };
  }
  return {
    publicKey: rawPublic || "",
    secretKey: rawSecret || "",
    source: "demo",
    isConfigured: false,
    isTest: false,
    isLive: false
  };
}

// server.ts
dotenv.config();
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var app = express();
var PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3e3;
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use((req, _res, next) => {
  if (req.body && typeof req.body === "string") {
    try {
      req.body = JSON.parse(req.body);
    } catch (_) {
    }
  }
  if (!req.body || typeof req.body !== "object") {
    req.body = {};
  }
  next();
});
app.use((req, _res, next) => {
  if (req.url) {
    try {
      if (req.url.startsWith("/api/index.ts") || req.url.startsWith("/api/index") || req.url.startsWith("/api?")) {
        const q0 = req.query?.["0"] || req.query && Object.values(req.query)[0];
        if (typeof q0 === "string" && q0) {
          const search = req.url.includes("?") ? req.url.substring(req.url.indexOf("?")) : "";
          req.url = `/api/${q0.replace(/^\//, "")}${search}`;
        }
      } else if (!req.url.startsWith("/api") && !req.url.startsWith("/sitemap") && !req.url.startsWith("/robots")) {
        req.url = `/api${req.url.startsWith("/") ? "" : "/"}${req.url}`;
      }
    } catch (_) {
    }
  }
  next();
});
var ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build"
    }
  }
});
var IS_VERCEL = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
var DATA_DIR = IS_VERCEL ? path.join("/tmp", "career_data") : path.join(__dirname, "data");
var DB_FILE = path.join(DATA_DIR, "db.json");
var PAYSTACK_CONFIG_FILE = path.join(DATA_DIR, "paystack-config.json");
var ADMIN_SECRET = process.env.ADMIN_SECRET || "admin_ke_2026";
function loadDatabase() {
  try {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
    } catch (_) {
    }
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, "utf-8");
      const parsed = JSON.parse(data);
      parsed.programmes = INITIAL_PROGRAMMES;
      if (Array.isArray(parsed.assessments)) {
        parsed.assessments = parsed.assessments.map((a) => {
          try {
            const reCalced = runFullCareerAssessment(
              {
                studentName: a.studentName,
                studentEmail: a.studentEmail,
                studentPhone: a.studentPhone,
                kcseYear: a.kcseYear,
                indexNumber: a.indexNumber,
                subjects: a.subjects,
                hobbies: a.hobbies || [],
                otherHobby: a.otherHobby,
                intendedCourse: a.intendedCourse
              },
              INITIAL_PROGRAMMES
            );
            return {
              ...reCalced,
              id: a.id,
              paymentStatus: a.paymentStatus || "UNPAID",
              paymentReference: a.paymentReference,
              paidAmount: a.paidAmount ?? 0,
              paidAt: a.paidAt,
              createdAt: a.createdAt,
              updatedAt: a.updatedAt
            };
          } catch (_) {
            return a;
          }
        });
      }
      return {
        programmes: INITIAL_PROGRAMMES,
        assessments: Array.isArray(parsed.assessments) ? parsed.assessments.slice(-30) : [],
        paymentLogs: Array.isArray(parsed.paymentLogs) ? parsed.paymentLogs.slice(-100) : []
      };
    }
  } catch (err) {
    console.error("Error loading database, resetting to defaults:", err);
  }
  const initialDb = {
    programmes: INITIAL_PROGRAMMES,
    assessments: [],
    paymentLogs: []
  };
  return initialDb;
}
function saveDatabase(databaseState) {
  setImmediate(() => {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const exportable = {
        assessments: (databaseState.assessments || []).slice(-30),
        paymentLogs: (databaseState.paymentLogs || []).slice(-100),
        savedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      fs.writeFile(DB_FILE, JSON.stringify(exportable), "utf-8", (err) => {
        if (err) console.error("Error saving database:", err);
      });
    } catch (err) {
      console.error("Error saving database:", err);
    }
  });
}
var db = loadDatabase();
app.get("/sitemap.xml", (req, res) => {
  const host = req.headers.host || "careerassistant.ke";
  const protocol = req.headers["x-forwarded-proto"] || (req.secure ? "https" : "http");
  const baseUrl = process.env.APP_URL || `${protocol}://${host}`;
  const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/?view=wizard</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/#how-it-works</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/#what-we-analyze</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/#faq</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>`;
  res.header("Content-Type", "application/xml; charset=utf-8");
  return res.send(xml);
});
app.get("/robots.txt", (req, res) => {
  const host = req.headers.host || "careerassistant.ke";
  const protocol = req.headers["x-forwarded-proto"] || (req.secure ? "https" : "http");
  const baseUrl = process.env.APP_URL || `${protocol}://${host}`;
  const robots = `User-agent: *
Allow: /
Disallow: /api/

Sitemap: ${baseUrl}/sitemap.xml
`;
  res.header("Content-Type", "text/plain; charset=utf-8");
  return res.send(robots);
});
app.get(["/api/health", "/health"], (_req, res) => {
  res.json({
    status: "ok",
    service: "Career Assistant KE Backend",
    programmesCount: db.programmes.length,
    institutionsCount: KENYAN_INSTITUTIONS.length,
    assessmentsCount: db.assessments.length
  });
});
app.get(["/api/institutions", "/institutions"], (req, res) => {
  const { county, type, search } = req.query;
  let list = [...KENYAN_INSTITUTIONS];
  if (county && typeof county === "string" && county !== "ALL") {
    list = list.filter((i) => i.county.toLowerCase() === county.toLowerCase());
  }
  if (type && typeof type === "string" && type !== "ALL") {
    list = list.filter((i) => i.type.toLowerCase() === type.toLowerCase());
  }
  if (search && typeof search === "string") {
    const q = search.toLowerCase().trim();
    list = list.filter(
      (i) => i.name.toLowerCase().includes(q) || i.shortName.toLowerCase().includes(q) || i.code.includes(q) || i.town.toLowerCase().includes(q) || i.county.toLowerCase().includes(q)
    );
  }
  res.json({
    total: list.length,
    allVerifiedCount: KENYAN_INSTITUTIONS.length,
    institutions: list
  });
});
app.get(["/api/config", "/config"], (_req, res) => {
  const keys = getPaystackKeys();
  res.json({
    paystackPublicKey: keys.publicKey,
    amountKsh: 100,
    isDemoKey: keys.publicKey.includes("demo") || keys.publicKey.includes("sample"),
    isConfigured: keys.isConfigured,
    isTest: keys.isTest
  });
});
app.post(["/api/assessments", "/assessments"], (req, res) => {
  try {
    const { studentName, studentEmail, studentPhone, kcseYear, indexNumber, subjects, hobbies, otherHobby, intendedCourse } = req.body;
    if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
      return res.status(400).json({ error: "Please enter your KCSE subjects and grades." });
    }
    const assessmentId = `ASMT_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const calculatedAssessment = runFullCareerAssessment(
      {
        studentName: studentName || "Form Four Graduate",
        studentEmail,
        studentPhone,
        kcseYear: parseInt(kcseYear, 10) || 2025,
        indexNumber,
        subjects,
        hobbies: hobbies || [],
        otherHobby,
        intendedCourse: intendedCourse || "I don't know yet"
      },
      db.programmes
    );
    const newAssessment = {
      ...calculatedAssessment,
      id: assessmentId,
      paymentStatus: "UNPAID",
      paidAmount: 0,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    db.assessments.push(newAssessment);
    saveDatabase(db);
    return res.status(201).json({
      ...newAssessment,
      isUnlocked: false
    });
  } catch (error) {
    console.error("Error creating assessment:", error);
    return res.status(500).json({ error: "Failed to process career assessment. Please check inputs and try again." });
  }
});
app.post(["/api/assessments/sync", "/assessments/sync"], (req, res) => {
  try {
    const incoming = req.body;
    if (!incoming || !incoming.id) {
      return res.status(400).json({ error: "Invalid assessment sync payload" });
    }
    const existingIdx = db.assessments.findIndex((a) => a.id === incoming.id);
    if (existingIdx >= 0) {
      const current = db.assessments[existingIdx];
      db.assessments[existingIdx] = {
        ...incoming,
        paymentStatus: current.paymentStatus === "PAID" ? "PAID" : incoming.paymentStatus,
        isUnlocked: current.paymentStatus === "PAID" || incoming.isUnlocked,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
    } else {
      db.assessments.push({
        ...incoming,
        createdAt: incoming.createdAt || (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
    saveDatabase(db);
    return res.json({ status: "ok", id: incoming.id });
  } catch (error) {
    console.error("Error syncing assessment:", error);
    return res.status(500).json({ error: "Failed to sync assessment" });
  }
});
app.get(["/api/assessments/:id", "/assessments/:id"], (req, res) => {
  const { id } = req.params;
  const assessment = db.assessments.find((a) => a.id === id);
  if (!assessment) {
    return res.status(404).json({ error: "Assessment not found. Please check your reference ID." });
  }
  const isPaid = assessment.paymentStatus === "PAID";
  return res.json({
    ...assessment,
    isUnlocked: isPaid
  });
});
app.get(["/api/paystack/config", "/paystack/config"], (_req, res) => {
  const keys = getPaystackKeys();
  const maskSecret = (key) => {
    if (!key || key.length < 12) return "sk_\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022";
    return `${key.slice(0, 7)}\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022${key.slice(-4)}`;
  };
  return res.json({
    publicKey: keys.publicKey,
    maskedSecretKey: maskSecret(keys.secretKey),
    isConfigured: keys.isConfigured,
    isTest: keys.isTest,
    isLive: keys.isLive,
    source: keys.source
  });
});
app.post(["/api/paystack/config", "/paystack/config"], async (req, res) => {
  try {
    const { publicKey, secretKey } = req.body;
    if (!publicKey || typeof publicKey !== "string" || !publicKey.trim()) {
      return res.status(400).json({ error: "Paystack Public Key is required (e.g., pk_test_...)" });
    }
    if (!secretKey || typeof secretKey !== "string" || !secretKey.trim()) {
      return res.status(400).json({ error: "Paystack Secret Key is required (e.g., sk_test_...)" });
    }
    const cleanPublic = cleanKey(publicKey);
    const cleanSecret = cleanKey(secretKey);
    if (!cleanPublic.startsWith("pk_test_") && !cleanPublic.startsWith("pk_live_")) {
      return res.status(400).json({
        error: 'Invalid Public Key format. It should start with "pk_test_" or "pk_live_".'
      });
    }
    if (!cleanSecret.startsWith("sk_test_") && !cleanSecret.startsWith("sk_live_")) {
      return res.status(400).json({
        error: 'Invalid Secret Key format. It should start with "sk_test_" or "sk_live_".'
      });
    }
    let paystackValidationMsg = "";
    const skipValidation = req.body.force === true;
    if (!skipValidation) {
      try {
        const testRes = await fetch("https://api.paystack.co/transaction/totals", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${cleanSecret}`
          }
        });
        const testData = await testRes.json();
        if (testRes.status === 401 || testData.status === false) {
          return res.status(400).json({
            error: `Paystack rejected Secret Key: ${testData.message || "Unauthorized / Invalid Key"}. Verify that you copied the complete Secret Key from Paystack Dashboard > Settings > API Keys & Webhooks.`,
            canForce: true
          });
        }
        paystackValidationMsg = "Key successfully verified with Paystack API.";
      } catch (testErr) {
        console.warn("Paystack connectivity test warning:", testErr?.message);
        paystackValidationMsg = "Key saved (Paystack network verification skipped).";
      }
    }
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const configData = {
      publicKey: cleanPublic,
      secretKey: cleanSecret,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    fs.writeFileSync(PAYSTACK_CONFIG_FILE, JSON.stringify(configData, null, 2), "utf-8");
    process.env.PAYSTACK_PUBLIC_KEY = cleanPublic;
    process.env.PAYSTACK_SECRET_KEY = cleanSecret;
    try {
      const envPath = path.join(__dirname, ".env");
      let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf-8") : "";
      if (!envContent.includes("PAYSTACK_PUBLIC_KEY=")) {
        envContent += `
PAYSTACK_PUBLIC_KEY="${cleanPublic}"
`;
      } else {
        envContent = envContent.replace(/PAYSTACK_PUBLIC_KEY=.*(\r?\n|$)/, `PAYSTACK_PUBLIC_KEY="${cleanPublic}"$1`);
      }
      if (!envContent.includes("PAYSTACK_SECRET_KEY=")) {
        envContent += `
PAYSTACK_SECRET_KEY="${cleanSecret}"
`;
      } else {
        envContent = envContent.replace(/PAYSTACK_SECRET_KEY=.*(\r?\n|$)/, `PAYSTACK_SECRET_KEY="${cleanSecret}"$1`);
      }
      fs.writeFileSync(envPath, envContent.trim() + "\n", "utf-8");
    } catch (_) {
    }
    const maskSecret = (key) => `${key.slice(0, 7)}\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022${key.slice(-4)}`;
    return res.json({
      success: true,
      message: paystackValidationMsg || "Paystack test keys saved successfully!",
      publicKey: cleanPublic,
      maskedSecretKey: maskSecret(cleanSecret),
      isConfigured: true,
      isTest: cleanPublic.startsWith("pk_test_") || cleanSecret.startsWith("sk_test_"),
      isLive: cleanPublic.startsWith("pk_live_") || cleanSecret.startsWith("sk_live_"),
      source: "custom"
    });
  } catch (err) {
    console.error("Error saving paystack configuration:", err);
    return res.status(500).json({ error: "Failed to save Paystack configuration" });
  }
});
app.post(["/api/paystack/config/reset", "/paystack/config/reset"], (_req, res) => {
  try {
    if (fs.existsSync(PAYSTACK_CONFIG_FILE)) {
      fs.unlinkSync(PAYSTACK_CONFIG_FILE);
    }
    delete process.env.PAYSTACK_PUBLIC_KEY;
    delete process.env.PAYSTACK_SECRET_KEY;
    return res.json({
      success: true,
      message: "Paystack keys reset to default sandbox.",
      isConfigured: false,
      source: "demo"
    });
  } catch (err) {
    console.error("Error resetting paystack configuration:", err);
    return res.status(500).json({ error: "Failed to reset Paystack configuration" });
  }
});
app.post(["/api/paystack/initialize", "/paystack/initialize"], async (req, res) => {
  try {
    const { assessmentId, email, assessment: incomingAssessment } = req.body;
    let assessment;
    const found = db.assessments.find((a) => a.id === assessmentId);
    if (found) {
      assessment = found;
    } else if (incomingAssessment && incomingAssessment.id) {
      assessment = incomingAssessment;
      db.assessments.push(assessment);
      saveDatabase(db);
    } else {
      assessment = {
        id: assessmentId || `ASMT_${Date.now()}`,
        studentName: "Form Four Student",
        studentEmail: email,
        kcseYear: 2025,
        subjects: [],
        hobbies: [],
        intendedCourse: "I don't know yet",
        meanGrade: "C+",
        meanPoints: 7,
        totalAggregate: 46,
        gradePointsDisplay: "46/84 pts",
        studentEstimatedClusterPoints: 32.5,
        paymentStatus: "UNPAID",
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
        previewSummary: {
          meanGrade: "C+",
          gradePointsDisplay: "46/84 pts",
          studentEstimatedClusterPoints: 32.5,
          potentialDegreeMatches: 2,
          potentialDiplomaMatches: 5,
          potentialTvetMatches: 8,
          totalEligibleInstitutions: 50,
          intendedCoursePreview: "I don't know yet",
          intendedCourseMeetsMinimums: true
        }
      };
      db.assessments.push(assessment);
    }
    if (assessment.paymentStatus === "PAID") {
      return res.json({
        alreadyPaid: true,
        message: "Assessment is already unlocked"
      });
    }
    const uniqueToken = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const reference = `CAKE_${assessment.id.replace(/[^a-zA-Z0-9]/g, "")}_${uniqueToken}`;
    const amountInKobo = 1e4;
    const customerEmail = email || assessment.studentEmail || `student_${assessment.id.toLowerCase().replace(/[^a-z0-9]/g, "")}@careerassistant.ke`;
    const rawOrigin = req.body.origin || req.headers.origin || req.headers.referer || process.env.APP_URL || "";
    let cleanOrigin = "";
    try {
      if (rawOrigin) {
        const u = new URL(rawOrigin.toString());
        cleanOrigin = `${u.protocol}//${u.host}`;
      }
    } catch (_) {
      cleanOrigin = rawOrigin.toString().replace(/\/$/, "");
    }
    const callback_url = cleanOrigin ? `${cleanOrigin}/?assessmentId=${encodeURIComponent(assessment.id)}&reference=${encodeURIComponent(reference)}` : void 0;
    const { secretKey, publicKey, isConfigured } = getPaystackKeys();
    const hasUsableSecret = isConfigured && isUsableSecretKey(secretKey);
    if (!hasUsableSecret && !isUsablePublicKey(publicKey)) {
      return res.status(400).json({
        error: "Paystack is not configured in this environment. If you added PAYSTACK_SECRET_KEY and PAYSTACK_PUBLIC_KEY in Vercel, please trigger a Redeploy on Vercel (Dashboard > Deployments > Redeploy) so the environment variables take effect.",
        code: "PAYSTACK_NOT_CONFIGURED"
      });
    }
    if (hasUsableSecret) {
      try {
        const payload = {
          email: customerEmail,
          amount: amountInKobo,
          currency: "KES",
          reference,
          metadata: {
            assessmentId: assessment.id,
            studentName: assessment.studentName,
            custom_fields: [
              { display_name: "Student Name", variable_name: "student_name", value: assessment.studentName },
              { display_name: "KCSE Year", variable_name: "kcse_year", value: String(assessment.kcseYear) }
            ]
          }
        };
        if (callback_url) {
          payload.callback_url = callback_url;
        }
        let response = await fetch("https://api.paystack.co/transaction/initialize", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${secretKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        });
        let paystackData = null;
        try {
          paystackData = await response.json();
        } catch (_) {
        }
        if (paystackData && !paystackData.status && paystackData.message && paystackData.message.toLowerCase().includes("currency")) {
          delete payload.currency;
          response = await fetch("https://api.paystack.co/transaction/initialize", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${secretKey}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
          });
          try {
            paystackData = await response.json();
          } catch (_) {
          }
        }
        if (paystackData && !paystackData.status && paystackData.message && (paystackData.message.toLowerCase().includes("callback") || paystackData.message.toLowerCase().includes("url"))) {
          delete payload.callback_url;
          response = await fetch("https://api.paystack.co/transaction/initialize", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${secretKey}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
          });
          try {
            paystackData = await response.json();
          } catch (_) {
          }
        }
        if (paystackData?.status && paystackData?.data?.authorization_url) {
          assessment.paymentStatus = "PAYMENT_PENDING";
          saveDatabase(db);
          return res.json({
            status: true,
            authorization_url: paystackData.data.authorization_url,
            access_code: paystackData.data.access_code,
            reference,
            amount: 100,
            currency: "KES",
            email: customerEmail,
            publicKey,
            callback_url
          });
        }
        if (paystackData && !paystackData.status) {
          console.error("Paystack initialization rejected by API:", paystackData);
          if (isUsablePublicKey(publicKey)) {
            console.log("Falling back to client-side inline checkout using public key");
            assessment.paymentStatus = "PAYMENT_PENDING";
            saveDatabase(db);
            return res.json({
              status: true,
              reference,
              amount: 100,
              currency: "KES",
              email: customerEmail,
              publicKey,
              useClientInline: true,
              warning: paystackData.message
            });
          }
          return res.status(400).json({
            error: paystackData.message || "Payment initialization was rejected by Paystack.",
            code: "PAYSTACK_REJECTED"
          });
        }
      } catch (paystackErr) {
        console.warn("Paystack network error during init:", paystackErr?.message);
        if (isUsablePublicKey(publicKey)) {
          assessment.paymentStatus = "PAYMENT_PENDING";
          saveDatabase(db);
          return res.json({
            status: true,
            reference,
            amount: 100,
            currency: "KES",
            email: customerEmail,
            publicKey,
            useClientInline: true
          });
        }
      }
    }
    if (isUsablePublicKey(publicKey)) {
      assessment.paymentStatus = "PAYMENT_PENDING";
      saveDatabase(db);
      return res.json({
        status: true,
        reference,
        amount: 100,
        currency: "KES",
        email: customerEmail,
        publicKey,
        useClientInline: true
      });
    }
    return res.status(400).json({
      error: "Unable to initialize transaction with Paystack. Please ensure your PAYSTACK_SECRET_KEY and PAYSTACK_PUBLIC_KEY are correctly configured in Vercel.",
      code: "PAYSTACK_INIT_FAILED"
    });
  } catch (error) {
    console.error("Error initializing payment:", error);
    return res.status(500).json({
      error: error?.message || "Server error initializing payment with Paystack"
    });
  }
});
app.post(["/api/paystack/verify", "/paystack/verify"], async (req, res) => {
  try {
    const { reference, assessmentId, assessment: incomingAssessment } = req.body;
    if (!reference || !assessmentId) {
      return res.status(400).json({ error: "Missing reference or assessmentId for verification" });
    }
    let assessment;
    const found = db.assessments.find((a) => a.id === assessmentId);
    if (found) {
      assessment = {
        ...found,
        ...incomingAssessment || {},
        id: found.id || assessmentId
      };
      const idx = db.assessments.findIndex((a) => a.id === assessmentId);
      if (idx !== -1) {
        db.assessments[idx] = assessment;
        saveDatabase(db);
      }
    } else if (incomingAssessment && incomingAssessment.id) {
      assessment = incomingAssessment;
      db.assessments.push(assessment);
      saveDatabase(db);
    } else {
      assessment = {
        id: assessmentId,
        studentName: "Form Four Student",
        kcseYear: 2025,
        subjects: [],
        hobbies: [],
        intendedCourse: "I don't know yet",
        meanGrade: "C+",
        meanPoints: 7,
        totalAggregate: 46,
        gradePointsDisplay: "46/84 pts",
        studentEstimatedClusterPoints: 32.5,
        paymentStatus: "UNPAID",
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
        previewSummary: {
          meanGrade: "C+",
          gradePointsDisplay: "46/84 pts",
          studentEstimatedClusterPoints: 32.5,
          potentialDegreeMatches: 2,
          potentialDiplomaMatches: 5,
          potentialTvetMatches: 8,
          totalEligibleInstitutions: 50,
          intendedCoursePreview: "I don't know yet",
          intendedCourseMeetsMinimums: true
        }
      };
      db.assessments.push(assessment);
    }
    const existingLog = db.paymentLogs.find((p) => p.reference === reference && p.status === "success");
    if (existingLog) {
      assessment.paymentStatus = "PAID";
      assessment.isUnlocked = true;
      assessment.paidAmount = existingLog.amount;
      assessment.paidAt = existingLog.verifiedAt;
      assessment.paymentReference = reference;
      saveDatabase(db);
      return res.json({
        success: true,
        status: "PAID",
        isUnlocked: true,
        assessmentId: assessment.id,
        assessment,
        message: "Payment previously verified."
      });
    }
    let isVerified = false;
    let verifiedAmount = 100;
    let gatewayMessage = "";
    let verifiedCurrency = "KES";
    let verifiedPaidAt = (/* @__PURE__ */ new Date()).toISOString();
    const { secretKey, isConfigured } = getPaystackKeys();
    const hasUsableSecret = isConfigured && isUsableSecretKey(secretKey);
    const isExplicitTestReference = (reference.startsWith("TEST_") || reference.startsWith("SIM_") || reference === "ALREADY_PAID") && process.env.NODE_ENV !== "production";
    if (isExplicitTestReference) {
      isVerified = true;
      verifiedAmount = 100;
      gatewayMessage = "Test simulation verified";
    } else if (hasUsableSecret) {
      try {
        let verifyData = null;
        let attempts = 0;
        const maxAttempts = 3;
        while (attempts < maxAttempts) {
          attempts++;
          const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${secretKey}`
            }
          });
          try {
            verifyData = await verifyRes.json();
          } catch (_) {
            verifyData = null;
          }
          if (verifyData?.status && verifyData?.data?.status === "success") {
            break;
          }
          const currStatus = verifyData?.data?.status;
          if (currStatus === "ongoing" || currStatus === "pending" || currStatus === "processing") {
            if (attempts < maxAttempts) {
              await new Promise((r) => setTimeout(r, 1200));
              continue;
            }
          }
          break;
        }
        if (verifyData?.status && verifyData?.data && verifyData?.data?.status === "success") {
          const rawAmount = Number(verifyData.data.amount) || 0;
          if (rawAmount >= 100) {
            isVerified = true;
            verifiedAmount = rawAmount >= 1e3 ? rawAmount / 100 : rawAmount;
            gatewayMessage = verifyData.data.gateway_response || "Approved";
            verifiedCurrency = verifyData.data.currency || "KES";
            if (verifyData.data.paid_at) {
              verifiedPaidAt = verifyData.data.paid_at;
            }
          } else {
            return res.status(400).json({
              error: `Paid amount (${rawAmount / 100} KES) is below the required KSh 100 fee.`,
              status: "amount_mismatch"
            });
          }
        } else {
          const txStatus = verifyData?.data?.status;
          const gatewayResp = verifyData?.data?.gateway_response;
          let userReason = "";
          if (txStatus === "abandoned") {
            userReason = 'Payment was abandoned or cancelled. Please click "Proceed to Pay" to complete your transaction on Paystack.';
          } else if (txStatus === "ongoing" || txStatus === "pending" || txStatus === "processing") {
            userReason = 'Transaction is currently processing on the payment network. Please wait a few moments and click "I Have Completed Payment \u2014 Verify Status" again.';
          } else if (txStatus === "failed") {
            userReason = `Payment was declined: ${gatewayResp || "The card or mobile payment could not be processed."}`;
          } else if (verifyData?.status === false) {
            userReason = verifyData?.message || `Transaction reference "${reference}" could not be found on Paystack.`;
          } else {
            userReason = gatewayResp || (txStatus ? `Transaction status: ${txStatus}` : "Payment could not be verified.");
          }
          if (txStatus === "failed") {
            assessment.paymentStatus = "PAYMENT_FAILED";
          } else {
            assessment.paymentStatus = "PAYMENT_PENDING";
          }
          saveDatabase(db);
          return res.status(400).json({
            error: userReason,
            status: txStatus || "unverified",
            gatewayResponse: gatewayResp
          });
        }
      } catch (liveErr) {
        console.error("Error during Paystack API verification:", liveErr);
        return res.status(502).json({
          error: "Unable to reach Paystack to verify payment status. Please check your connection and retry.",
          status: "gateway_unreachable"
        });
      }
    } else {
      return res.status(400).json({
        error: "Paystack secret key is not configured in the server environment. Please configure PAYSTACK_SECRET_KEY in your Vercel Environment Variables to verify transactions.",
        status: "config_missing"
      });
    }
    if (isVerified) {
      const nowIso = (/* @__PURE__ */ new Date()).toISOString();
      assessment.paymentStatus = "PAID";
      assessment.isUnlocked = true;
      assessment.paymentReference = reference;
      assessment.paidAmount = verifiedAmount;
      assessment.paidAt = verifiedPaidAt || nowIso;
      assessment.updatedAt = nowIso;
      db.paymentLogs.push({
        reference,
        assessmentId: assessment.id,
        amount: verifiedAmount,
        currency: verifiedCurrency,
        status: "success",
        verifiedAt: assessment.paidAt,
        gatewayResponse: gatewayMessage
      });
      saveDatabase(db);
      return res.json({
        success: true,
        status: "PAID",
        isUnlocked: true,
        assessmentId: assessment.id,
        assessment,
        message: "Payment verified successfully. Full career report unlocked!"
      });
    }
    assessment.paymentStatus = "PAYMENT_FAILED";
    saveDatabase(db);
    return res.status(400).json({ error: "Payment could not be verified. Please check reference." });
  } catch (error) {
    console.error("Payment verification error:", error);
    return res.status(500).json({ error: "Internal error verifying payment. Please retry." });
  }
});
app.post("/api/assessments/:id/ai-explain", async (req, res) => {
  try {
    const { id } = req.params;
    const assessment = db.assessments.find((a) => a.id === id);
    if (!assessment) {
      return res.status(404).json({ error: "Assessment not found" });
    }
    if (assessment.paymentStatus !== "PAID") {
      return res.status(403).json({ error: "Full AI guidance is only available after unlocking the report." });
    }
    if (assessment.detailedResults?.aiCounselorGuidance) {
      return res.json({ guidance: assessment.detailedResults.aiCounselorGuidance });
    }
    const qualifyingCategories = Array.from(new Set(
      (assessment.detailedResults?.eligibleProgrammes || []).map((p) => p.category)
    ));
    const unmetSubjects = Array.from(new Set(
      (assessment.detailedResults?.allEvaluations || []).flatMap((p) => p.subjectChecks.filter((sc) => !sc.passed).map((sc) => `${sc.subject} (needs ${sc.requiredGrade})`))
    )).slice(0, 5);
    const prompt = `
You are an expert Kenyan academic counselor helping a Form Four KCSE graduate interpret their career options for KUCCPS placement.

Student Assessment Data:
- Student Name: ${assessment.studentName}
- KCSE Examination Year: ${assessment.kcseYear}
- KCSE Mean Grade: ${assessment.meanGrade} (Aggregate: ${assessment.totalAggregate}/84)
- Estimated Weighted Cluster Points: ${assessment.studentEstimatedClusterPoints} (Degree baseline)
- Verified Subjects & Grades: ${assessment.subjects.map((s) => `${s.subject}: ${s.grade}`).join(", ")}
- Stated Hobbies & Interests: ${assessment.hobbies.join(", ")} ${assessment.otherHobby ? `(Other: ${assessment.otherHobby})` : ""}
- Intended Course: ${assessment.intendedCourse}
- Intended Course Eligibility: ${assessment.detailedResults?.intendedCourseAnalysis.status}
- Qualifying Discovery Categories: ${qualifyingCategories.join(", ") || "All general fields"}
- Total Confirmed Qualifying Programmes: ${assessment.detailedResults?.eligibleProgrammes.length || 0}
- Key Subjects Limiting Access to Certain Programmes: ${unmetSubjects.length > 0 ? unmetSubjects.join(", ") : "None identified"}
- Top Recommended Programmes: ${assessment.detailedResults?.topRecommendations.map((r) => `${r.programmeName} (${r.level})`).join(", ")}
- Alternative TVET Pathways: ${assessment.detailedResults?.alternativePathways.map((a) => `${a.programmeName} (${a.reason})`).join(", ")}

Please provide an encouraging, straightforward, data-driven 3-paragraph career advisory for this student:
1. Academic Strengths & Discovery Horizon: Praise the specific subjects they excelled in. Remind them they are not limited to one single career category; highlight 2-3 fields they qualify for based on their actual results.
2. Honest Guidance on their Intended Course & Alternatives: If they met requirements, explain how to prepare; if they fell short on specific subjects, clearly explain why without discouragement and present the TVET / diploma progression pathway.
3. Actionable Next Steps for KUCCPS: Provide 3 concrete tips on how to balance their degree and diploma choices on the official KUCCPS student portal.

Important Guidelines:
- Ground your advice STRICTLY in the provided data. Do not invent grades, cut-offs, or guarantee placement.
- Use Kenyan educational terminology (KUCCPS, TVET, National Polytechnics, University credit transfer).
- Keep the tone respectful, professional, and practical.
`;
    const aiResponse = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an authentic, wise, and highly respected Kenyan education counselor and career mentor."
      }
    });
    const guidanceText = aiResponse.text || "We encourage you to review your recommended courses and confirm current requirements with KUCCPS.";
    if (assessment.detailedResults) {
      assessment.detailedResults.aiCounselorGuidance = guidanceText;
      saveDatabase(db);
    }
    return res.json({ guidance: guidanceText });
  } catch (error) {
    console.error("Error generating AI guidance:", error);
    return res.json({
      guidance: "Based on your KCSE subject combination and interests, you have strong pathways available across both university and TVET programmes. Ensure you balance your KUCCPS choices between ambitious degree programmes and solid diploma options."
    });
  }
});
function requireAdmin(req, res, next) {
  const authHeader = req.headers["x-admin-key"] || req.query.adminKey;
  if (authHeader === ADMIN_SECRET) {
    return next();
  }
  return res.status(401).json({ error: "Unauthorized: Invalid Admin Secret Key" });
}
app.get("/api/admin/analytics", requireAdmin, (_req, res) => {
  const total = db.assessments.length;
  const paid = db.assessments.filter((a) => a.paymentStatus === "PAID").length;
  const unpaid = total - paid;
  const conversionRate = total > 0 ? Number((paid / total * 100).toFixed(1)) : 0;
  const totalRevenue = paid * 100;
  const assessmentsByYear = {};
  const courseCounts = {};
  const hobbyCounts = {};
  const gradeDist = {};
  for (const a of db.assessments) {
    assessmentsByYear[a.kcseYear] = (assessmentsByYear[a.kcseYear] || 0) + 1;
    gradeDist[a.meanGrade] = (gradeDist[a.meanGrade] || 0) + 1;
    if (a.intendedCourse) {
      courseCounts[a.intendedCourse] = (courseCounts[a.intendedCourse] || 0) + 1;
    }
    for (const h of a.hobbies || []) {
      hobbyCounts[h] = (hobbyCounts[h] || 0) + 1;
    }
  }
  const mostSelectedCourses = Object.entries(courseCounts).map(([course, count]) => ({ course, count })).sort((a, b) => b.count - a.count).slice(0, 10);
  const popularHobbies = Object.entries(hobbyCounts).map(([hobby, count]) => ({ hobby, count })).sort((a, b) => b.count - a.count).slice(0, 10);
  return res.json({
    totalAssessments: total,
    paidAssessments: paid,
    unpaidAssessments: unpaid,
    conversionRate,
    totalRevenueKsh: totalRevenue,
    assessmentsByYear,
    mostSelectedCourses,
    popularHobbies,
    gradeDistribution: gradeDist
  });
});
app.get("/api/admin/assessments", requireAdmin, (req, res) => {
  const { search, status } = req.query;
  let list = [...db.assessments];
  if (status && status !== "ALL") {
    list = list.filter((a) => a.paymentStatus === status);
  }
  if (search && typeof search === "string") {
    const q = search.toLowerCase();
    list = list.filter(
      (a) => a.studentName.toLowerCase().includes(q) || a.id.toLowerCase().includes(q) || a.studentEmail && a.studentEmail.toLowerCase().includes(q) || a.intendedCourse.toLowerCase().includes(q)
    );
  }
  list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return res.json(list.map((a) => ({
    id: a.id,
    studentName: a.studentName,
    studentEmail: a.studentEmail,
    kcseYear: a.kcseYear,
    meanGrade: a.meanGrade,
    studentEstimatedClusterPoints: a.studentEstimatedClusterPoints,
    intendedCourse: a.intendedCourse,
    paymentStatus: a.paymentStatus,
    paymentReference: a.paymentReference,
    paidAmount: a.paidAmount,
    createdAt: a.createdAt
  })));
});
app.get("/api/admin/programmes", requireAdmin, (_req, res) => {
  res.json(db.programmes);
});
app.post("/api/admin/programmes", requireAdmin, (req, res) => {
  try {
    const newProg = {
      ...req.body,
      id: `prog-${Date.now()}`,
      active: req.body.active !== false
    };
    db.programmes.push(newProg);
    saveDatabase(db);
    return res.status(201).json(newProg);
  } catch (err) {
    return res.status(400).json({ error: "Failed to add programme" });
  }
});
app.put("/api/admin/programmes/:id", requireAdmin, (req, res) => {
  const { id } = req.params;
  const index = db.programmes.findIndex((p) => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Programme not found" });
  }
  db.programmes[index] = { ...db.programmes[index], ...req.body };
  saveDatabase(db);
  return res.json(db.programmes[index]);
});
app.delete("/api/admin/programmes/:id", requireAdmin, (req, res) => {
  const { id } = req.params;
  db.programmes = db.programmes.filter((p) => p.id !== id);
  saveDatabase(db);
  return res.json({ success: true });
});
app.use((err, _req, res, _next) => {
  console.error("Unhandled server error:", err);
  if (res.headersSent) return;
  return res.status(500).json({
    error: err?.message || "Internal server error processing request",
    code: "SERVER_ERROR"
  });
});
async function startServer() {
  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    try {
      const vitePkg = "vite";
      const { createServer } = await import(
        /* @vite-ignore */
        vitePkg
      );
      const vite = await createServer({
        server: { middlewareMode: true },
        appType: "spa"
      });
      app.use(vite.middlewares);
    } catch (e) {
      console.warn("Vite dev middleware not loaded:", e);
    }
  } else if (!process.env.VERCEL) {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Career Assistant KE server running on http://0.0.0.0:${PORT}`);
  });
}
if (!process.env.VERCEL && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
  startServer();
}
var server_default = app;
export {
  app,
  cleanKey,
  server_default as default,
  getPaystackKeys,
  isUsablePublicKey,
  isUsableSecretKey
};
