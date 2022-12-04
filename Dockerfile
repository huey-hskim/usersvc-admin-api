# 1. 베이스 설치
FROM       node:18.4
MAINTAINER hskim.nothing@gmail.com

# *. 타임존 설정
ARG DEBIAN_FRONTEND=noninteractive
ENV TZ=Asia/Seoul

# 2. 기본 패키지 설치
RUN     apt -y update
RUN     apt install -y tzdata vim

# 3. make user and dir
RUN     useradd svcuser -G adm
RUN     mkdir /home/svcuser && chown svcuser:svcuser /home/svcuser

USER    svcuser
WORKDIR	/home/svcuser
RUN     mkdir log srv srv/usersvc-admin-api

# 4. package install
WORKDIR	/home/svcuser/srv/usersvc-admin-api
COPY    . .
RUN     npm run build

# 9. run
EXPOSE 	8087
WORKDIR	/home/svcuser/srv/usersvc-admin-api

CMD	["npm", "start"]
