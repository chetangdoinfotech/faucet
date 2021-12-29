-- MySQL dump 10.13  Distrib 5.7.36, for Linux (x86_64)
--
-- Host: localhost    Database: dth_faucets
-- ------------------------------------------------------
-- Server version	5.7.36-0ubuntu0.18.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `adminLastNonces`
--

DROP TABLE IF EXISTS `adminLastNonces`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `adminLastNonces` (
  `AdminWalletId` varchar(50) DEFAULT NULL,
  `lastNonce` int(11) DEFAULT NULL,
  `net` set('mainnet','testnet') DEFAULT 'mainnet'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `adminLastNonces`
--

LOCK TABLES `adminLastNonces` WRITE;
/*!40000 ALTER TABLE `adminLastNonces` DISABLE KEYS */;
INSERT INTO `adminLastNonces` VALUES ('0x6077516eea959B7fb04bB211AD0569351f3eBDbc',33,'testnet');
/*!40000 ALTER TABLE `adminLastNonces` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dth_faucet`
--

DROP TABLE IF EXISTS `dth_faucet`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dth_faucet` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `client_ip` varchar(50) NOT NULL DEFAULT '',
  `client_wallet` varchar(42) NOT NULL DEFAULT '',
  `txhash` varchar(100) NOT NULL,
  `contractused` varchar(100) NOT NULL DEFAULT '',
  `net` set('mainnet','testnet') DEFAULT 'testnet',
  `token_name` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `_idx` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dth_faucet`
--

LOCK TABLES `dth_faucet` WRITE;
/*!40000 ALTER TABLE `dth_faucet` DISABLE KEYS */;
INSERT INTO `dth_faucet` VALUES (9,'2021-12-16 07:28:53','127.0.0.1','0x385b68e0b7E3C31BE0fd87221e43d300864E0247','0x0f398a391e4baa28b9117602487102b32a88fb5e7efb7d84cb196dbd587b8296','-','testnet');
/*!40000 ALTER TABLE `dth_faucet` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'dth_faucets'
--

--
-- Dumping routines for database 'dth_faucets'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2021-12-16 14:34:52
