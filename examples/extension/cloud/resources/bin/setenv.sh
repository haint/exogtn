#!/bin/sh
#
# Copyright (C) 2012 eXo Platform SAS.
# 
# This is free software; you can redistribute it and/or modify it
# under the terms of the GNU Lesser General Public License as
# published by the Free Software Foundation; either version 2.1 of
# the License, or (at your option) any later version.
# 
# This software is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
# Lesser General Public License for more details.
# 
# You should have received a copy of the GNU Lesser General Public
# License along with this software; if not, write to the Free
# Software Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA
# 02110-1301 USA, or see the FSF site: http://www.fsf.org.
#

# production script to set environment variables for eXo Platform


# custom JAVA options
[ -z "$EXO_JAVA_OPTS" ]  && EXO_JAVA_OPTS="-Xms512m -Xmx1240m -XX:MaxPermSize=256m"
[ -z "$JMXACC" ] && JMXACC="$CATALINA_HOME/conf/jmxremote.access"
[ -z "$JMXPAS" ] && JMXPAS="$CATALINA_HOME/conf/jmxremote.password"

# master tenant name
[ -z "$TENANT_MASTERHOST" ]  && TENANT_MASTERHOST="localhost"

# master tenant repository
[ -z "$TENANT_REPOSITORY" ]  && TENANT_REPOSITORY="as1"

# cloud database
[ -z "$EXO_DB_HOST" ]  && EXO_DB_HOST="localhost:3306"
[ -z "$EXO_DB_USER" ]  && EXO_DB_USER="sa"
[ -z "$EXO_DB_PASSWORD" ]  && EXO_DB_PASSWORD=""
[ -z "$EXO_DB_CONF_DIR" ]  && EXO_DB_CONF_DIR="$CATALINA_HOME/gatein/conf/cloud/databases"

# dir for jcr data for all tenants
[ -z "$EXO_TENANT_DATA_DIR" ]  && EXO_TENANT_DATA_DIR="$CATALINA_HOME/gatein/data/jcr"

# dir for admin data
[ -z "$EXO_ADMIN_DATA_DIR" ]  && EXO_ADMIN_DATA_DIR="$CATALINA_HOME/data"

# admin config
[ -z "$EXO_ADMIN_CONF_DIR" ]  && EXO_ADMIN_CONF_DIR="$CATALINA_HOME/gatein/conf/cloud/cloud-admin"

# admin email
[ -z "$CLOUD_MAIL_HOST" ]  && CLOUD_MAIL_HOST="smtp.gmail.com"
[ -z "$CLOUD_MAIL_PORT" ]  && CLOUD_MAIL_PORT="465"
[ -z "$CLOUD_MAIL_SSL" ]  && CLOUD_MAIL_SSL="true"
[ -z "$CLOUD_MAIL_USER" ]  && CLOUD_MAIL_USER="exo.plf.cloud.test1@gmail.com"
[ -z "$CLOUD_MAIL_PASSWORD" ]  && CLOUD_MAIL_PASSWORD="exo.plf.cloud.test112321"
[ -z "$CLOUD_MAIL_SMTP_SOCKETFACTORY_CLASS" ]  && CLOUD_MAIL_SMTP_SOCKETFACTORY_CLASS="javax.net.ssl.SSLSocketFactory"
[ -z "$CLOUD_MAIL_SMTP_SOCKETFACTORY_FALLBACK" ]  && CLOUD_MAIL_SMTP_SOCKETFACTORY_FALLBACK="false"
[ -z "$CLOUD_MAIL_SMTP_SOCKETFACTORY_PORT" ]  && CLOUD_MAIL_SMTP_SOCKETFACTORY_PORT="465"
[ -z "$CLOUD_MAIL_SMTP_AUTH" ]  & CLOUD_MAIL_SMTP_AUTH="true"
[ -z "$CLOUD_ADMIN_EMAIL" ]  && CLOUD_ADMIN_EMAIL="exo.plf.cloud.test1@gmail.com"
[ -z "$CLOUD_LOGGER_EMAIL" ]  && CLOUD_LOGGER_EMAIL="exo.plf.cloud.test1@gmail.com"

# admin credentials
[ -z "$CLOUD_AGENT_USERNAME" ]  && CLOUD_AGENT_USERNAME="cloudadmin"
[ -z "$CLOUD_AGENT_PASSWORD" ]  && CLOUD_AGENT_PASSWORD="cloudadmin"

# dir for jcr backup files 
[ -z "$EXO_BACKUP_DIR" ]  && EXO_BACKUP_DIR="$CATALINA_HOME/gatein/backup"

# this host external address
# HOST_EXTERNAL_ADDR=`ifconfig eth0 | grep 'inet addr:' | cut -d: -f2 | awk '{ print $1}'`
[ -z "$HOST_EXTERNAL_ADDR" ]  && HOST_EXTERNAL_ADDR="localhost"

# eXo profiles
#[ -z "$EXO_PROFILES" ]  && EXO_PROFILES="-Dexo.profiles=default,cloud"
if [ "$EXO_PROFILES" = "" -o "$EXO_PROFILES" = "-Dexo.profiles=default" ] ; then
    EXO_PROFILES="-Dexo.profiles=default,cloud"
fi

LOG_OPTS="-Dorg.apache.commons.logging.Log=org.apache.commons.logging.impl.SimpleLog"
SECURITY_OPTS="-Djava.security.auth.login.config=../conf/jaas.conf"

EXO_OPTS="-Dexo.product.developing=false -Dexo.conf.dir.name=gatein/conf"
IDE_OPTS="-Djavasrc=$JAVA_HOME/src.zip -Djre.lib=$JAVA_HOME/jre/lib"

if $cygwin; then
  EXO_BACKUP_DIR=`cygpath --absolute --windows "$EXO_BACKUP_DIR"`
  EXO_TENANT_DATA_DIR=`cygpath --absolute --windows "$EXO_TENANT_DATA_DIR"`
  EXO_ADMIN_LOGS_DIR=`cygpath --absolute --windows "$EXO_ADMIN_LOGS_DIR"`
  EXO_ADMIN_DATA_DIR=`cygpath --absolute --windows "$EXO_ADMIN_DATA_DIR"`
  EXO_ADMIN_CONF_DIR=`cygpath --absolute --windows "$EXO_ADMIN_CONF_DIR"`
  EXO_DB_DIR=`cygpath --absolute --windows "$EXO_DB_DIR"`
  JMXPAS=`cygpath --absolute --windows "$JMXPAS"`
  JMXACC=`cygpath --absolute --windows "$JMXACC"`
fi

EXO_CLOUD_OPTS="-javaagent:../lib/cloud-agent-instrument-1.1-M7-SNAPSHOT.jar=../gatein/conf/cloud/agent-configuration.xml \
    -Dexo.backup.dir=$EXO_BACKUP_DIR \
    -Dgroovy.script.method.iteration.time=60000 \
    -Dtenant.masterhost=$TENANT_MASTERHOST \
    -Dtenant.repository.name=$TENANT_REPOSITORY \
    -Dtenant.data.dir=$EXO_TENANT_DATA_DIR \
    -Dtenant.db.host=$EXO_DB_HOST \
    -Dtenant.db.user=$EXO_DB_USER \
    -Dtenant.db.password=$EXO_DB_PASSWORD \
    -Dtenant.db.conf.dir=$EXO_DB_CONF_DIR \
    -Dadmin.agent.auth.username=$CLOUD_AGENT_USERNAME \
    -Dadmin.agent.auth.password=$CLOUD_AGENT_PASSWORD \
    -Dcloud.admin.log.dir=$EXO_ADMIN_LOGS_DIR \
    -Dcloud.admin.mail.host=$CLOUD_MAIL_HOST \
    -Dcloud.admin.mail.port=$CLOUD_MAIL_PORT \
    -Dcloud.admin.mail.ssl=$CLOUD_MAIL_SSL \
    -Dcloud.admin.mail.user=$CLOUD_MAIL_USER \
    -Dcloud.admin.mail.password=$CLOUD_MAIL_PASSWORD \
    -Dcloud.admin.mail.smtp.socketFactory.class=$CLOUD_MAIL_SMTP_SOCKETFACTORY_CLASS \
    -Dcloud.admin.mail.smtp.socketFactory.fallback=$CLOUD_MAIL_SMTP_SOCKETFACTORY_FALLBACK \
    -Dcloud.admin.mail.smtp.socketFactory.port=$CLOUD_MAIL_SMTP_SOCKETFACTORY_PORT \
    -Dcloud.admin.mail.smtp.auth=$CLOUD_MAIL_SMTP_AUTH \
    -Dcloud.admin.mail.admin.email=$CLOUD_ADMIN_EMAIL \
    -Dcloud.admin.mail.logger.email=$CLOUD_LOGGER_EMAIL \
    -Dcloud.admin.data.dir=$EXO_ADMIN_DATA_DIR \
    -Dcloud.admin.configuration.dir=$EXO_ADMIN_CONF_DIR \
    -Dcloud.admin.configuration.file=$EXO_ADMIN_CONF_DIR/admin.properties \
    -Dlogback.configurationFile=$CATALINA_HOME/conf/logback.xml"

EXO_CLOUD_SECURITY_OPTS="-Djava.security.manager=com.exoplatform.cloud.security.TenantSecurityManager \
    -Djava.security.policy==../conf/catalina.policy"

JMX_OPTS="-Dcom.sun.management.jmxremote=true -Djava.rmi.server.hostname=$HOST_EXTERNAL_ADDR \
    -Dcom.sun.management.jmxremote.authenticate=true \
    -Dcom.sun.management.jmxremote.password.file=$JMXPAS \
    -Dcom.sun.management.jmxremote.access.file=$JMXACC \
    -Dcom.sun.management.jmxremote.ssl=false"

# Remote debug configuration
#REMOTE_DEBUG="-Xdebug -Xrunjdwp:transport=dt_socket,address=8000,server=y,suspend=y"
REMOTE_DEBUG=""

export CATALINA_OPTS="$EXO_JAVA_OPTS $CATALINA_OPTS $LOG_OPTS $SECURITY_OPTS $EXO_OPTS $IDE_OPTS $EXO_CLOUD_OPTS $EXO_CLOUD_SECURITY_OPTS $EXO_CLOUD_ADMIN_OPTS $JMX_OPTS $REMOTE_DEBUG $EXO_PROFILES"

export CLASSPATH="$CATALINA_HOME/lib/cloud-agent-security-1.1-M7-SNAPSHOT.jar:$CATALINA_HOME/conf/:$CATALINA_HOME/lib/jul-to-slf4j-1.5.8.jar:$CATALINA_HOME/lib/slf4j-api-1.5.8.jar:$CATALINA_HOME/lib/security-logback-logging-1.1-M7-SNAPSHOT.jar:$CATALINA_HOME/lib/logback-classic-0.9.20.jar:$CATALINA_HOME/lib/logback-core-0.9.20.jar"

