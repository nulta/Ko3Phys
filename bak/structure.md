# Ko3Phys의 구조

## Body
### 가지는 속성
- 위치: Vector2
- 속도: Vector2
- 질량: number [kg]
<!-- - 각도: number [rad] -->
<!-- - 각속도: number [rad/s] -->

## World
### 가지는 속성
- 중력: Vector2 = new Vector2(0, -9.8)

### 기능
- 모든 Body의 레퍼런스를 가집니다.
    - 새로운 Body를 등록하고 삭제합니다.
    - 시간의 흐름에 따라 모든 Body를 업데이트합니다.
        - 시간이 흐를 때 모든 Body의 위치와 운동을 업데이트합니다.
        - 모든 Body에게 중력을 줍니다.
- 모든 Force의 레퍼런스를 가집니다.
- 모든 Body의 충돌을 처리합니다.
    - Body들이 서로 충돌할 때, 각 Body의 상태를 업데이트합니다.

