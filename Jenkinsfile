pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIALS_ID = 'dockerhub-creds'
        GITHUB_CREDENTIALS_ID    = 'github-token'
        FRONTEND_IMAGE           = 'omarabdo4/cars-web'
        BACKEND_IMAGE            = 'omarabdo4/cars-api'
        IMAGE_TAG                = "staging-${BUILD_NUMBER}"
        STACK_FILE               = 'docker-compose.yml'
        STACK_NAME               = 'app'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Images') {
            steps {
                script {
                    sh "docker build -t ${FRONTEND_IMAGE}:${IMAGE_TAG} -t ${FRONTEND_IMAGE}:staging ./frontend"
                    sh "docker build -t ${BACKEND_IMAGE}:${IMAGE_TAG} -t ${BACKEND_IMAGE}:staging ./backend"
                }
            }
        }

        stage('Push to Docker Hub') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: "${DOCKERHUB_CREDENTIALS_ID}", usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                        sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin'
                        sh "docker push ${FRONTEND_IMAGE}:${IMAGE_TAG}"
                        sh "docker push ${FRONTEND_IMAGE}:staging"
                        sh "docker push ${BACKEND_IMAGE}:${IMAGE_TAG}"
                        sh "docker push ${BACKEND_IMAGE}:staging"
                    }
                }
            }
        }

        stage('Deploy to Docker Swarm') {
            steps {
                script {
                    sh "docker service update --image ${FRONTEND_IMAGE}:${IMAGE_TAG} ${STACK_NAME}_frontend"
                    sh "docker service update --image ${BACKEND_IMAGE}:${IMAGE_TAG} ${STACK_NAME}_backend"
                }
            }
        }
    }

    post {
        always {
            sh "docker rmi -f ${FRONTEND_IMAGE}:${IMAGE_TAG} ${BACKEND_IMAGE}:${IMAGE_TAG} || true"
        }
    }
}
