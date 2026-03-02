# ROS 버전 결정
FROM ros:humble-ros-base

# 패키지 설치
RUN apt-get update && apt-get install -y \
    python3-pip \
    ros-humble-sensor-msgs \
    ros-humble-std-msgs \
    ros-humble-nav-msgs \
    ros-humble-tf2-msgs \
    ros-humble-turtlebot3-msgs \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /root/ros2_ws

# 환경 설정 자동화
RUN echo "source /opt/ros/humble/setup.bash" >> ~/.bashrc

# 기본 실행 명령
CMD ["bash"]