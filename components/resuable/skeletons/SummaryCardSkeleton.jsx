import { Card, Skeleton, Row, Col } from "antd";

const skeletonCardStyles = {
    height: 120,
    borderRadius: 12,
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
};

export default function SummaryCardSkeleton({ count = 4 }) {
    return (
        <Row gutter={[16, 16]}>
            {Array.from({ length: count }).map((_, index) => (
                <Col xs={24} sm={12} lg={6} key={index}>
                    <Card style={skeletonCardStyles} bodyStyle={{ padding: 20 }}>
                        <div className="flex justify-between items-center">
                            <div className="flex-1">
                                <Skeleton.Input active size="small" style={{ width: "70%" }} />
                                <div style={{ marginTop: 12 }}>
                                    <Skeleton.Input active size="default" style={{ width: "60%" }} />
                                </div>
                            </div>
                            <Skeleton.Avatar active size={40} shape="circle" />
                        </div>
                    </Card>
                </Col>
            ))}
        </Row>
    );
}
