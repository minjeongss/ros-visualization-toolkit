import rclpy
from rclpy.node import Node
import importlib
import os
import csv
from datetime import datetime

class UnifiedFileLogger(Node):
    def __init__(self):
        super().__init__('unified_file_logger')
        self.subscriptions_dict = {}
        
        # 단일 로그 파일 설정
        self.filename = datetime.now().strftime('csv/ros2_log_%Y%m%d_%H%M%S.csv')
        self.file = open(self.filename, 'w', newline='', encoding='utf-8')
        self.writer = csv.writer(self.file)
        
        # CSV 헤더 (시간, 토픽명, 메시지 타입, 데이터 내용)
        self.writer.writerow(['timestamp', 'topic_name', 'message_type', 'data'])
        
        # 새로운 토픽 감시 타이머 (1.0초마다 새 토픽 검색)
        self.create_timer(1.0, self.update_subscriptions)
        
        self.get_logger().info(f"📁 통합 로그 기록 시작: {self.filename}")

    def get_msg_class(self, type_str):
        try:
            parts = type_str.split('/')
            if len(parts) == 2: parts.insert(1, 'msg')
            module = importlib.import_module(f"{parts[0]}.msg")
            return getattr(module, parts[2]), type_str
        except: return None, None

    def update_subscriptions(self):
        for name, types in self.get_topic_names_and_types():
            if name in self.subscriptions_dict or any(x in name for x in ['/parameter_events', '/rosout']):
                continue
            
            topic_type_str = types[0]
            msg_class, full_type = self.get_msg_class(topic_type_str)
            
            if msg_class:
                self.subscriptions_dict[name] = self.create_subscription(
                    msg_class, 
                    name, 
                    lambda msg, tn=name, tt=full_type: self.log_to_single_file(msg, tn, tt), 
                    10
                )
                print(f"📡 모니터링 추가: {name}")

    def log_to_single_file(self, msg, topic_name, topic_type):
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S.%f')[:-3]
        self.writer.writerow([timestamp, topic_name, topic_type, str(msg)])
        
        # 실시간 확인 용도
        # self.file.flush()

    def destroy_node(self):
        self.file.close()
        super().destroy_node()

def main():
    rclpy.init()
    node = UnifiedFileLogger()
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        node.get_logger().info("🛑 기록 종료. 파일을 저장합니다.")
    finally:
        node.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()