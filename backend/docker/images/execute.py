import sys, os, signal, resource, io

def set_limits():
    resource.setrlimit(resource.RLIMIT_AS, (128 * 1024 * 1024, 128 * 1024 * 1024))
    resource.setrlimit(resource.RLIMIT_CPU, (5, 5))

def timeout_handler(signum, frame):
    sys.exit("Time Limit Exceeded")

try:
    set_limits()
    signal.signal(signal.SIGALRM, timeout_handler)
    signal.alarm(10)
    user_code = os.environ.get('USER_CODE', '')
    input_data = os.environ.get('INPUT_DATA', '')
    sys.stdin = io.StringIO(input_data)
    exec(user_code)
except Exception as e:
    print(f"Runtime Error: {str(e)}", file=sys.stderr)
    sys.exit(1)