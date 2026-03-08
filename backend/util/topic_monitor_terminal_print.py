import rclpy
from rclpy.node import Node
import importlib
import traceback
from rclpy.qos import QoSProfile, ReliabilityPolicy, HistoryPolicy

class UniversalSubscriber(Node):
    def __init__(self):
        super().__init__('universal_subscriber')
        self.subscriptions_dict = {}
        
        # 1초마다 새로운 토픽 감시
        self.timer = self.create_timer(1.0, self.update_subscriptions)
        self.get_logger().info("🚀 실시간 모니터링 시작!")

    def get_msg_class(self, type_str):
        """
        'std_msgs/msg/String' 형태의 문자열을 실제 파이썬 클래스로 변환
        """
        try:
            # 문자열 분리 (예: /geometry_msgs/msg/Twist)
            parts = type_str.split('/')
            if len(parts) == 2: # 'std_msgs/String' 형태일 경우 대응
                parts.insert(1, 'msg')
            
            package_name = parts[0]
            msg_name = parts[2]
            
            # 모듈 동적 로드 (예: geometry_msgs.msg)
            module_path = f"{package_name}.msg"
            module = importlib.import_module(module_path)
            
            # 모듈 내에서 실제 클래스 추출 (예: Twist)
            msg_class = getattr(module, msg_name)
            return msg_class
        except Exception as e:
            self.get_logger().error(f"클래스 로드 실패 ({type_str}): {e}")
            return None

    def update_subscriptions(self):
        topic_names_and_types = self.get_topic_names_and_types()

        qos_profile = QoSProfile(
            reliability=ReliabilityPolicy.RELIABLE, # 손실 시 재전송 요청 
            history=HistoryPolicy.KEEP_ALL,        # 버퍼가 꽉 차도 버리지 않고 보관 (메모리 주의)
            depth=100                              # 대기열 깊게 설정
        )

        for topic_name, topic_types in topic_names_and_types:
            # 구독 토핑 필터링(제외 토픽 및 이미 구독 중인 토픽)
            if topic_name in self.subscriptions_dict or any(x in topic_name for x in ['/parameter_events', '/rosout']):
                continue

            # 메시지 클래스 가져오기
            topic_type_str = topic_types[0]
            msg_class = self.get_msg_class(topic_type_str)
            
            if msg_class:
                try:
                    # 구독 생성 및 출력
                    sub = self.create_subscription(
                        msg_class,
                        topic_name,
                        lambda msg, tn=topic_name: self.topic_callback(msg, tn),
                        qos_profile
                    )
                    self.subscriptions_dict[topic_name] = sub
                    print(f"✅ 구독 성공: {topic_name} [{topic_type_str}]")
                except Exception as e:
                    print(f"❌ 구독 생성 에러 ({topic_name}): {e}")

    def topic_callback(self, msg, topic_name):
        print(f"\n[RECEIVED: {topic_name}]")
        print(f"Content: {str(msg)}")
        print("-" * 50)

def main(args=None):
    rclpy.init(args=args)
    node = UniversalSubscriber()
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()