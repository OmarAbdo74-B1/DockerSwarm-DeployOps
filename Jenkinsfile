pipeline {
    agent any

    environment {
        DOCKER_REGISTRY = 'omarabdo4'
        IMAGE_TAG       = 'staging'
        BACKEND_IMAGE   = "${DOCKER_REGISTRY}/cars-api"
        FRONTEND_IMAGE  = "${DOCKER_REGISTRY}/cars-web"
        BUILD_TAG       = "${IMAGE_TAG}-${BUILD_NUMBER}"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Images') {
            steps {
                sh """
                    docker build -t ${FRONTEND_IMAGE}:${BUILD_TAG} -t ${FRONTEND_IMAGE}:${IMAGE_TAG} ./frontend
                    docker build -t ${BACKEND_IMAGE}:${BUILD_TAG} -t ${BACKEND_IMAGE}:${IMAGE_TAG} ./backend
                """
            }
        }

        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh """
                        echo "${DOCKER_PASS}" | docker login -u "${DOCKER_USER}" --password-stdin
                        docker push ${FRONTEND_IMAGE}:${BUILD_TAG}
                        docker push ${FRONTEND_IMAGE}:${IMAGE_TAG}
                        docker push ${BACKEND_IMAGE}:${BUILD_TAG}
                        docker push ${BACKEND_IMAGE}:${IMAGE_TAG}
                    """
                }
            }
        }

        stage('Deploy to Docker Swarm') {
            steps {
                sh """
                    docker service update --image ${FRONTEND_IMAGE}:${BUILD_TAG} --with-registry-auth app_frontend
                    docker service update --image ${BACKEND_IMAGE}:${BUILD_TAG} --with-registry-auth app_backend
                """
            }
        }
    }

    post {
        always {
            sh """
                docker rmi -f ${FRONTEND_IMAGE}:${BUILD_TAG} ${BACKEND_IMAGE}:${BUILD_TAG} || true
                docker logout || true
            """
        }
        success {
            echo "Pipeline deployed successfully with tag: ${BUILD_TAG}"
        }
        failure {
            echo "Pipeline deployment failed."
        }
    }
}
