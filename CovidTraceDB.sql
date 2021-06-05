-- MySQL dump 10.13  Distrib 8.0.23, for Linux (x86_64)
--
-- Host: 127.0.0.1    Database: CovidTrace
-- ------------------------------------------------------
-- Server version	8.0.19-0ubuntu5

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `CovidTrace`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `CovidTrace` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `CovidTrace`;

--
-- Table structure for table `CheckIn`
--

DROP TABLE IF EXISTS `CheckIn`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `CheckIn` (
  `CheckInID` int NOT NULL AUTO_INCREMENT,
  `VenueID` int NOT NULL,
  `Date` varchar(255) DEFAULT NULL,
  `UserID` int NOT NULL,
  PRIMARY KEY (`CheckInID`),
  KEY `VenueID` (`VenueID`),
  KEY `UserID` (`UserID`),
  CONSTRAINT `CheckIn_ibfk_1` FOREIGN KEY (`VenueID`) REFERENCES `Venue` (`VenueID`),
  CONSTRAINT `CheckIn_ibfk_2` FOREIGN KEY (`UserID`) REFERENCES `UserProfile` (`UserID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `CheckIn`
--

LOCK TABLES `CheckIn` WRITE;
/*!40000 ALTER TABLE `CheckIn` DISABLE KEYS */;
/*!40000 ALTER TABLE `CheckIn` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `HealthOfficial`
--

DROP TABLE IF EXISTS `HealthOfficial`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `HealthOfficial` (
  `HealthOfficialID` int NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `password` varchar(160) NOT NULL,
  `FirstName` varchar(255) DEFAULT NULL,
  `LastName` varchar(255) DEFAULT NULL,
  `Age` int DEFAULT NULL,
  `Email` varchar(255) DEFAULT NULL,
  `ContactNumber` int DEFAULT NULL,
  `CurrentHotspotID` int DEFAULT NULL,
  PRIMARY KEY (`HealthOfficialID`),
  KEY `CurrentHotspotID` (`CurrentHotspotID`),
  CONSTRAINT `HealthOfficial_ibfk_1` FOREIGN KEY (`CurrentHotspotID`) REFERENCES `Hotspot` (`HotspotID`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `HealthOfficial`
--

LOCK TABLES `HealthOfficial` WRITE;
/*!40000 ALTER TABLE `HealthOfficial` DISABLE KEYS */;
/*!40000 ALTER TABLE `HealthOfficial` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Hotspot`
--

DROP TABLE IF EXISTS `Hotspot`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Hotspot` (
  `HotspotID` int NOT NULL AUTO_INCREMENT,
  `VenueID` int NOT NULL,
  `Density` int NOT NULL,
  `TimeFrame` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`HotspotID`),
  KEY `VenueID` (`VenueID`),
  CONSTRAINT `Hotspot_ibfk_1` FOREIGN KEY (`VenueID`) REFERENCES `Venue` (`VenueID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Hotspot`
--

LOCK TABLES `Hotspot` WRITE;
/*!40000 ALTER TABLE `Hotspot` DISABLE KEYS */;
/*!40000 ALTER TABLE `Hotspot` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `UserProfile`
--

DROP TABLE IF EXISTS `UserProfile`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `UserProfile` (
  `UserID` int NOT NULL AUTO_INCREMENT,
  `username` varchar(255) DEFAULT NULL,
  `password` varchar(160) DEFAULT NULL,
  `FirstName` varchar(255) DEFAULT NULL,
  `LastName` varchar(255) DEFAULT NULL,
  `Age` int DEFAULT NULL,
  `Email` varchar(255) DEFAULT NULL,
  `ContactNumber` int DEFAULT NULL,
  PRIMARY KEY (`UserID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `UserProfile`
--

LOCK TABLES `UserProfile` WRITE;
/*!40000 ALTER TABLE `UserProfile` DISABLE KEYS */;
/*!40000 ALTER TABLE `UserProfile` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Venue`
--

DROP TABLE IF EXISTS `Venue`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Venue` (
  `VenueID` int NOT NULL AUTO_INCREMENT,
  `Address` varchar(255) DEFAULT NULL,
  `FirstName` varchar(255) DEFAULT NULL,
  `LastName` varchar(255) DEFAULT NULL,
  `ContactNumber` int DEFAULT NULL,
  PRIMARY KEY (`VenueID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Venue`
--

LOCK TABLES `Venue` WRITE;
/*!40000 ALTER TABLE `Venue` DISABLE KEYS */;
/*!40000 ALTER TABLE `Venue` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `VenueManager`
--

DROP TABLE IF EXISTS `VenueManager`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `VenueManager` (
  `ManagerID` int NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `password` varchar(160) NOT NULL,
  `FirstName` varchar(255) DEFAULT NULL,
  `LastName` varchar(255) DEFAULT NULL,
  `Age` int DEFAULT NULL,
  `Email` varchar(255) DEFAULT NULL,
  `ContactNumber` int DEFAULT NULL,
  `ListedVenues` int DEFAULT NULL,
  PRIMARY KEY (`ManagerID`),
  KEY `ListedVenues` (`ListedVenues`),
  CONSTRAINT `VenueManager_ibfk_1` FOREIGN KEY (`ListedVenues`) REFERENCES `Venue` (`VenueID`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `VenueManager`
--

LOCK TABLES `VenueManager` WRITE;
/*!40000 ALTER TABLE `VenueManager` DISABLE KEYS */;
/*!40000 ALTER TABLE `VenueManager` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2021-06-01  4:52:12
