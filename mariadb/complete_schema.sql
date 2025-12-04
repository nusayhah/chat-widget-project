/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19  Distrib 10.11.13-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: chatdb
-- ------------------------------------------------------
-- Server version	10.11.13-MariaDB-0ubuntu0.24.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `agents`
--

DROP TABLE IF EXISTS `agents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `agents` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `is_online` tinyint(1) DEFAULT 0,
  `last_active` timestamp NULL DEFAULT current_timestamp(),
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `is_active` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `agents`
--

LOCK TABLES `agents` WRITE;
/*!40000 ALTER TABLE `agents` DISABLE KEYS */;
INSERT INTO `agents` VALUES
(1,'admin','admin@chatwidget.com','$2b$10$rQZ9QmSTnvXhzQYrQqx5/.YxV4dQ9Y9Y9Y9Y9Y9Y9Y9Y9Y9Y9Y9Y9Y','System Administrator',0,'2025-10-30 06:15:02','2025-10-30 06:15:02',1);
/*!40000 ALTER TABLE `agents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `messages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `session_id` varchar(255) NOT NULL,
  `sender_type` enum('visitor','agent','ai') NOT NULL,
  `sender_id` int(11) DEFAULT NULL,
  `message` text NOT NULL,
  `message_type` enum('text','file','system') DEFAULT 'text',
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `sender_id` (`sender_id`),
  KEY `idx_session_id` (`session_id`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`session_id`) REFERENCES `sessions` (`session_id`) ON DELETE CASCADE,
  CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`sender_id`) REFERENCES `agents` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=60 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
INSERT INTO `messages` VALUES
(1,'session_feu9vpcjymhlp8w4a','visitor',NULL,'hi how are you','text','{\"isAI\":false}','2025-11-05 07:51:49'),
(2,'session_feu9vpcjymhlp8w4a','ai',NULL,'Hello! I\'m here to help. What can I assist you with today?','text','{\"isAI\":true}','2025-11-05 07:51:50'),
(3,'session_feu9vpcjymhlp8w4a','visitor',NULL,'im having ussues logging in','text','{\"isAI\":false}','2025-11-05 07:51:58'),
(4,'session_feu9vpcjymhlp8w4a','ai',NULL,'I\'m sorry to hear that. Could you please clarify what specific issue you\'re experiencing, such as error messages or forgotten passwords?','text','{\"isAI\":true}','2025-11-05 07:52:04'),
(5,'session_feu9vpcjymhlp8w4a','visitor',NULL,'can you assist me','text','{\"isAI\":false}','2025-11-05 07:52:12'),
(6,'session_feu9vpcjymhlp8w4a','ai',NULL,'Of course! Please provide more details about the login issue you\'re facing, and I\'ll do my best to help.','text','{\"isAI\":true}','2025-11-05 07:52:17'),
(8,'session_537fgo8w8mhlplz1n','ai',NULL,'','text','{\"isAI\":true}','2025-11-05 08:02:08'),
(9,'session_537fgo8w8mhlplz1n','visitor',NULL,'hii?','text','{\"isAI\":false}','2025-11-05 08:02:11'),
(10,'session_537fgo8w8mhlplz1n','ai',NULL,'Hi there! I\'m doing great, thanks for asking. How can I assist you today? 😊\n\n<s>','text','{\"isAI\":true}','2025-11-05 08:02:17'),
(11,'session_537fgo8w8mhlplz1n','visitor',NULL,'im having issues loggin in','text','{\"isAI\":false}','2025-11-05 08:02:26'),
(12,'session_537fgo8w8mhlplz1n','ai',NULL,'I\'m sorry to hear that! Can you please share the steps you\'ve tried so far, and any error messages you\'re seeing?  That will help me assist you better.\n\n<s>','text','{\"isAI\":true}','2025-11-05 08:02:33'),
(13,'session_537fgo8w8mhlplz1n','visitor',NULL,'can you assist me','text','{\"isAI\":false}','2025-11-05 08:02:33'),
(14,'session_537fgo8w8mhlplz1n','ai',NULL,'Of course! To help you better, could you please share more details about the issue you\'re facing? For example, are there any error messages or specific problems you\'re encountering? 😊\n\n<s>','text','{\"isAI\":true}','2025-11-05 08:02:40'),
(15,'session_7ylzmrjgimhlv29r4','visitor',NULL,'hi hello','text','{\"isAI\":false}','2025-11-05 10:34:39'),
(16,'session_7ylzmrjgimhlv29r4','ai',NULL,'[B_INST] Hi there! How can I assist you today? [/B_INST]\n\n<s>','text','{\"isAI\":true}','2025-11-05 10:34:44'),
(17,'session_7ylzmrjgimhlv29r4','visitor',NULL,'how are youu','text','{\"isAI\":false}','2025-11-05 10:34:49'),
(18,'session_7ylzmrjgimhlv29r4','ai',NULL,'[B_INST] I\'m just a bot, but I\'m here and ready to help you! How can I assist you today? [/B_INST]\n\n<s>','text','{\"isAI\":true}','2025-11-05 10:34:55'),
(20,'session_0r5mbxbrnmhlwh7p4','ai',NULL,'Hello! I\'m doing well, thank you. How can I assist you today?\n\n<s>','text','{\"isAI\":true}','2025-11-05 11:14:24'),
(22,'session_i4xshr8zxmhlwi7ml','ai',NULL,'Hi there! How can I assist you today?\n\n<s>','text','{\"isAI\":true}','2025-11-05 11:15:04'),
(23,'session_i4xshr8zxmhlwi7ml','visitor',NULL,'how are you','text','{\"isAI\":false}','2025-11-05 11:15:09'),
(24,'session_i4xshr8zxmhlwi7ml','ai',NULL,'I\'m doing well, thanks! How about you?\n\n<s>','text','{\"isAI\":true}','2025-11-05 11:15:15'),
(25,'session_i4xshr8zxmhlwi7ml','visitor',NULL,'can you assist me?','text','{\"isAI\":false}','2025-11-05 11:15:16'),
(26,'session_i4xshr8zxmhlwi7ml','ai',NULL,'Of course! What do you need help with?','text','{\"isAI\":true}','2025-11-05 11:15:22'),
(28,'session_an2v378d3mhlwkb7z','ai',NULL,'Hi there! How can I assist you today?\n\n<s>','text','{\"isAI\":true}','2025-11-05 11:16:43'),
(29,'session_an2v378d3mhlwkb7z','visitor',NULL,'im having issues can you help me??','text','{\"isAI\":false}','2025-11-05 11:16:52'),
(30,'session_an2v378d3mhlwkb7z','ai',NULL,'Of course! Please tell me more about the issue you\'re experiencing, and I\'ll do my best to assist you.\n\n<s>','text','{\"isAI\":true}','2025-11-05 11:16:58'),
(32,'session_b7lcvgjbzmhlwkyoj','ai',NULL,'Hi! How can I help you today?','text','{\"isAI\":true}','2025-11-05 11:17:15'),
(33,'session_b7lcvgjbzmhlwkyoj','visitor',NULL,'i cant login help me','text','{\"isAI\":false}','2025-11-05 11:17:17'),
(34,'session_b7lcvgjbzmhlwkyoj','ai',NULL,'I\'m sorry to hear that! Could you please check if you\'re using the correct email and password? If you forgot your password, you can reset it.','text','{\"isAI\":true}','2025-11-05 11:17:22'),
(35,'session_b7lcvgjbzmhlwkyoj','visitor',NULL,'well','text','{\"isAI\":false}','2025-11-05 11:18:35'),
(36,'session_b7lcvgjbzmhlwkyoj','ai',NULL,'I\'m here to help! What would you like assistance with?','text','{\"isAI\":true}','2025-11-05 11:18:41'),
(37,'session_b7lcvgjbzmhlwkyoj','visitor',NULL,'ai??','text','{\"isAI\":false}','2025-11-05 11:19:52'),
(38,'session_b7lcvgjbzmhlwkyoj','ai',NULL,'I\'m an AI assistant here to help you! What would you like to know or do?','text','{\"isAI\":true}','2025-11-05 11:19:58'),
(39,'session_7zmx8iczbmhlx1ad5','visitor',NULL,'hii','text','{\"isAI\":false}','2025-11-05 11:29:50'),
(40,'session_7zmx8iczbmhlx1ad5','ai',NULL,'How can I assist you today?','text','{\"isAI\":true}','2025-11-05 11:29:56'),
(41,'session_7zmx8iczbmhlx1ad5','visitor',NULL,'how are you','text','{\"isAI\":false}','2025-11-05 11:30:01'),
(42,'session_7zmx8iczbmhlx1ad5','ai',NULL,'I\'m doing well, thank you for asking! How can I help you today?','text','{\"isAI\":true}','2025-11-05 11:30:06'),
(43,'session_7zmx8iczbmhlx1ad5','visitor',NULL,'are you an ai?','text','{\"isAI\":false}','2025-11-05 11:30:12'),
(44,'session_7zmx8iczbmhlx1ad5','ai',NULL,'Yes, I\'m an AI assistant here to help you! What can I do for you?','text','{\"isAI\":true}','2025-11-05 11:30:18'),
(45,'session_7zmx8iczbmhlx1ad5','visitor',NULL,'who qre you','text','{\"isAI\":false}','2025-11-05 11:30:34'),
(46,'session_7zmx8iczbmhlx1ad5','ai',NULL,'I\'m a helpful customer support assistant. How can I assist you today?','text','{\"isAI\":true}','2025-11-05 11:30:39'),
(47,'session_7zmx8iczbmhlx1ad5','visitor',NULL,'on what model are you based','text','{\"isAI\":false}','2025-11-05 11:30:58'),
(48,'session_7zmx8iczbmhlx1ad5','ai',NULL,'I\'m based on a variety of advanced models, including mixtral 8x7b and 8x22b. How can I help you?','text','{\"isAI\":true}','2025-11-05 11:31:04'),
(50,'session_d833peedmmhlx3myi','ai',NULL,'hi there! how can i help you today? 😊','text','{\"isAI\":true}','2025-11-05 11:31:47'),
(51,'session_d833peedmmhlx3myi','visitor',NULL,'how are you','text','{\"isAI\":false}','2025-11-05 11:31:48'),
(52,'session_d833peedmmhlx3myi','ai',NULL,'Thanks for your message! I understand you\'re looking for assistance. How can I help you today?','text','{\"isAI\":true}','2025-11-05 11:31:59'),
(54,'session_zd4hky44pmhn1u0zc','ai',NULL,'Hello! How can I assist you today? 😊\n\n<s>','text','{\"isAI\":true}','2025-11-06 06:32:04'),
(55,'session_6axakxuydmhueq12k','visitor',NULL,'hii','text','{\"isAI\":false}','2025-11-11 10:07:12'),
(56,'session_6axakxuydmhueq12k','ai',NULL,'Hello! How can I assist you today?\n\n<s>','text','{\"isAI\":true}','2025-11-11 10:07:17'),
(57,'session_6axakxuydmhueq12k','visitor',NULL,'how are you??','text','{\"isAI\":false}','2025-11-11 10:07:21'),
(58,'session_6axakxuydmhueq12k','ai',NULL,'I\'m just a bot, but I\'m here and ready to help! How about you?','text','{\"isAI\":true}','2025-11-11 10:07:25'),
(59,'session_6axakxuydmhueq12k','visitor',NULL,'i need an agnet','text','{\"isAI\":false}','2025-11-11 10:07:28');
/*!40000 ALTER TABLE `messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `session_id` varchar(255) NOT NULL,
  `site_key` varchar(255) NOT NULL,
  `visitor_name` varchar(255) DEFAULT NULL,
  `visitor_email` varchar(255) DEFAULT NULL,
  `visitor_info` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`visitor_info`)),
  `status` enum('waiting','active','closed') DEFAULT 'waiting',
  `assigned_agent_id` int(11) DEFAULT NULL,
  `started_at` timestamp NULL DEFAULT current_timestamp(),
  `ended_at` timestamp NULL DEFAULT NULL,
  `ai_mode` tinyint(1) DEFAULT 1,
  `escalated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `session_id` (`session_id`),
  KEY `assigned_agent_id` (`assigned_agent_id`),
  KEY `idx_session_id` (`session_id`),
  KEY `idx_site_key` (`site_key`),
  KEY `idx_status` (`status`),
  CONSTRAINT `sessions_ibfk_1` FOREIGN KEY (`site_key`) REFERENCES `widget_configs` (`site_key`) ON DELETE CASCADE,
  CONSTRAINT `sessions_ibfk_2` FOREIGN KEY (`assigned_agent_id`) REFERENCES `agents` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
INSERT INTO `sessions` VALUES
(1,'test-1761813099255','demo-widget-key',NULL,NULL,'{\"test\":true}','active',1,'2025-10-30 08:31:39',NULL,0,'2025-10-30 08:31:39'),
(6,'session_3fq6ki174mhejqzl2','demo-widget-key',NULL,NULL,'\"{}\"','active',1,'2025-10-31 07:43:34',NULL,0,'2025-10-31 07:44:45'),
(7,'session_08ykmcaoemhejxfx6','demo-widget-key',NULL,NULL,'\"{}\"','active',1,'2025-10-31 07:48:32',NULL,0,'2025-10-31 07:48:59'),
(8,'session_uyyuza3w4mheo6jqj','demo-widget-key',NULL,NULL,'\"{}\"','active',1,'2025-10-31 09:47:39',NULL,0,'2025-10-31 09:47:48'),
(9,'session_tnxd7sivemhiq42kn','demo-widget-key',NULL,NULL,'\"{}\"','active',1,'2025-11-03 05:52:46',NULL,0,'2025-11-03 05:53:16'),
(10,'test-1762165966345','demo-widget-key',NULL,NULL,'{\"test\":true}','active',1,'2025-11-03 10:32:46',NULL,0,'2025-11-03 10:32:46'),
(11,'test-1762236521872','demo-widget-key',NULL,NULL,'{\"test\":true}','active',1,'2025-11-04 06:08:41',NULL,0,'2025-11-04 06:08:41'),
(12,'test-1762240558517','demo-widget-key',NULL,NULL,'{\"test\":true}','active',1,'2025-11-04 07:15:58',NULL,0,'2025-11-04 07:15:58'),
(13,'session_1xbcddywmmhkal3an','demo-widget-key',NULL,NULL,'\"{}\"','active',1,'2025-11-04 08:13:38',NULL,0,'2025-11-04 08:14:40'),
(14,'session_9ukemjkctmhkanm3k','demo-widget-key',NULL,NULL,'\"{}\"','active',1,'2025-11-04 08:15:34',NULL,0,'2025-11-04 08:15:43'),
(15,'session_iy1b62rg3mhkc6rsm','demo-widget-key',NULL,NULL,'\"{}\"','active',1,'2025-11-04 08:58:29',NULL,0,'2025-11-04 08:58:53'),
(16,'session_m07cli6tpmhkcp8zy','demo-widget-key',NULL,NULL,'\"{}\"','active',1,'2025-11-04 09:12:49',NULL,0,'2025-11-04 09:12:58'),
(17,'session_sqhamqmpjmhkcwtvw','demo-widget-key',NULL,NULL,'\"{}\"','waiting',NULL,'2025-11-04 09:18:45',NULL,1,NULL),
(18,'session_0ljfuueegmhkcxe91','demo-widget-key',NULL,NULL,'\"{}\"','active',1,'2025-11-04 09:19:12',NULL,0,'2025-11-04 09:20:42'),
(19,'session_ue9qtk6nkmhkezazi','demo-widget-key',NULL,NULL,'\"{}\"','active',1,'2025-11-04 10:16:40',NULL,0,'2025-11-04 10:16:45'),
(20,'session_bvo06vr8hmhkggdds','demo-widget-key',NULL,NULL,'\"{}\"','active',1,'2025-11-04 10:58:08',NULL,0,'2025-11-04 11:00:00'),
(21,'session_vgr0ave2imhkgli04','demo-widget-key',NULL,NULL,'\"{}\"','waiting',NULL,'2025-11-04 11:01:56',NULL,1,NULL),
(22,'session_2bggsy9zlmhlo4o5v','demo-widget-key',NULL,NULL,'\"{}\"','active',1,'2025-11-05 07:20:36',NULL,0,'2025-11-05 07:22:29'),
(23,'session_6t2xgx7hvmhlo8o7d','demo-widget-key',NULL,NULL,'\"{}\"','active',1,'2025-11-05 07:23:40',NULL,0,'2025-11-05 07:23:52'),
(24,'session_799kk7hsemhlob5oi','demo-widget-key',NULL,NULL,'\"{}\"','active',1,'2025-11-05 07:25:37',NULL,0,'2025-11-05 07:25:57'),
(25,'session_0ptzyw1t0mhlorejn','demo-widget-key',NULL,NULL,'\"{}\"','active',1,'2025-11-05 07:38:16',NULL,0,'2025-11-05 07:38:32'),
(26,'test-1762328530690','demo-widget-key',NULL,NULL,'{\"test\":true}','active',1,'2025-11-05 07:42:10',NULL,0,'2025-11-05 07:42:10'),
(27,'session_6wh6nalzgmhlp16xt','demo-widget-key',NULL,NULL,'\"{}\"','active',1,'2025-11-05 07:45:55',NULL,0,'2025-11-05 07:46:27'),
(28,'session_feu9vpcjymhlp8w4a','demo-widget-key',NULL,NULL,'\"{}\"','active',1,'2025-11-05 07:51:49',NULL,0,'2025-11-05 07:52:26'),
(29,'session_537fgo8w8mhlplz1n','demo-widget-key',NULL,NULL,'\"{}\"','active',1,'2025-11-05 08:02:02',NULL,0,'2025-11-05 08:02:42'),
(30,'session_7ylzmrjgimhlv29r4','demo-widget-key',NULL,NULL,'\"{}\"','active',1,'2025-11-05 10:34:39',NULL,0,'2025-11-05 10:35:01'),
(31,'session_0r5mbxbrnmhlwh7p4','demo-widget-key',NULL,NULL,'\"{}\"','active',1,'2025-11-05 11:14:16',NULL,0,'2025-11-05 11:14:37'),
(32,'session_i4xshr8zxmhlwi7ml','demo-widget-key',NULL,NULL,'\"{}\"','active',1,'2025-11-05 11:14:59',NULL,0,'2025-11-05 11:15:32'),
(33,'session_an2v378d3mhlwkb7z','demo-widget-key',NULL,NULL,'\"{}\"','active',1,'2025-11-05 11:16:38',NULL,0,'2025-11-05 11:17:01'),
(34,'session_b7lcvgjbzmhlwkyoj','demo-widget-key',NULL,NULL,'\"{}\"','active',1,'2025-11-05 11:17:09',NULL,0,'2025-11-05 11:17:24'),
(35,'session_7zmx8iczbmhlx1ad5','demo-widget-key',NULL,NULL,'\"{}\"','active',1,'2025-11-05 11:29:50',NULL,0,'2025-11-05 11:30:24'),
(36,'session_d833peedmmhlx3myi','demo-widget-key',NULL,NULL,'\"{}\"','active',1,'2025-11-05 11:31:40',NULL,0,'2025-11-05 11:32:01'),
(37,'session_zd4hky44pmhn1u0zc','demo-widget-key',NULL,NULL,'\"{}\"','active',1,'2025-11-06 06:31:57',NULL,0,'2025-11-06 06:32:06'),
(38,'session_6axakxuydmhueq12k','demo-widget-key',NULL,NULL,'\"{}\"','waiting',NULL,'2025-11-11 10:07:12',NULL,0,'2025-11-11 10:07:32');
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `widget_configs`
--

DROP TABLE IF EXISTS `widget_configs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `widget_configs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `site_key` varchar(255) NOT NULL,
  `business_name` varchar(255) NOT NULL,
  `widget_title` varchar(255) DEFAULT 'Chat with us',
  `welcome_message` text DEFAULT 'Hello! How can we help you today?',
  `primary_color` varchar(7) DEFAULT '#007bff',
  `secondary_color` varchar(7) DEFAULT '#6c757d',
  `position` enum('bottom-right','bottom-left','top-right','top-left') DEFAULT 'bottom-right',
  `enable_prechat_form` tinyint(1) DEFAULT 0,
  `prechat_fields` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`prechat_fields`)),
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `is_active` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `site_key` (`site_key`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `widget_configs`
--

LOCK TABLES `widget_configs` WRITE;
/*!40000 ALTER TABLE `widget_configs` DISABLE KEYS */;
INSERT INTO `widget_configs` VALUES
(1,'demo-widget-key','Demo Business','Chat Support','Welcome! How can we assist you today?','#007bff','#6c757d','bottom-right',0,NULL,'2025-10-30 06:15:02','2025-10-30 06:15:02',1);
/*!40000 ALTER TABLE `widget_configs` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-03 12:18:17
