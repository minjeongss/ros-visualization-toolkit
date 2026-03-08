import rclpy
from rclpy.node import Node
import importlib
import os
import csv
from datetime import datetime

class TopicFileLogger(Node):
    def __init__(self):
        super().__init__('topic_file_logger')
        self.subscriptions_dict = {}
        self.file_handles = {}  # 파일 객체 보관
        self.csv_writers = {}   # CSV 작성기 보관

        # 저장할 폴더 생성 (현재 시간 기준)
        self.log_dir = datetime.now().strftime('ros2_log_%Y%m%d_%H%M%S')
        os.makedirs(self.log_dir, exist_ok=True)
        
        # 새로운 토픽 감시 타이머 (1초)
        self.create_timer(1.0, self.update_subscriptions)
        
        self.get_logger().info(f"📂 로그 저장 시작! 폴더명: {self.log_dir}")

    def get_msg_class(self, type_str):
        try:
            parts = type_str.split('/')
            if len(parts) == 2: parts.insert(1, 'msg')
            module = importlib.import_module(f"{parts[0]}.msg")
            return getattr(module, parts[2])
        except: return None

    def update_subscriptions(self):
        for name, types in self.get_topic_names_and_types():
            # 구독 토핑 필터링(제외 토픽 및 이미 구독 중인 토픽)
            if name in self.subscriptions_dict or any(x in name for x in ['/parameter_events', '/rosout']):
                continue
            
            msg_class = self.get_msg_class(types[0])
            if msg_class:
                # 파일 생성 및 CSV 헤더 작성
                # 토픽명에서 '/'를 '_'로 바꿔서 파일명 생성
                safe_name = name.replace('/', '_').lstrip('_')
                file_path = os.path.join(self.log_dir, f"{safe_name}.csv")
                
                f = open(file_path, 'w', newline='', encoding='utf-8')
                writer = csv.writer(f)
                writer.writerow(['timestamp', 'data']) # 헤더 작성
                
                self.file_handles[name] = f
                self.csv_writers[name] = writer
                
                # 구독 시작
                self.subscriptions_dict[name] = self.create_subscription(
                    msg_class, name, lambda msg, tn=name: self.log_to_file(msg, tn), 10
                )
                print(f"📁 새 파일 생성 및 기록 중: {name}")

    def log_to_file(self, msg, topic_name):
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S.%f')[:-3]
        self.csv_writers[topic_name].writerow([timestamp, str(msg)])
        
        # 실시간성을 위해 가끔 flush (성능을 위해 매번 하지는 않음)
        # 잦은 기록이 걱정된다면 이 부분은 생략 가능
        # self.file_handles[topic_name].flush()

    def destroy_node(self):
        # 노드 종료 시 열려있는 모든 파일 닫기
        for f in self.file_handles.values():
            f.close()
        super().destroy_node()

def main():
    rclpy.init()
    node = TopicFileLogger()
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        node.get_logger().info("🛑 기록을 중단하고 파일을 저장합니다.")
    finally:
        node.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()